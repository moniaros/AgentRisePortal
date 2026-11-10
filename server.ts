import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import {
  applySecurityHeaders,
  createRateLimiter,
  extractSessionFromRequest,
  signSessionToken,
  verifyPassword,
} from './server/security';
import {
  AiOperationType,
  PlanTierId,
  PLAN_CATALOG,
  changeAgencyPlan,
  consumeAiCredits,
} from './server/creditLedger';
import {
  appendChainedAuditLog,
  getAgencyBilling,
  getCollectionData,
  getServerStore,
  saveAgencyBilling,
  setCollectionData,
} from './server/persistence';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatError(err: unknown): { status: number; message: string } {
  const message = err instanceof Error ? err.message : String(err);
  const statusObj = err as { status?: number; code?: number };
  const status =
    typeof statusObj?.status === 'number'
      ? statusObj.status
      : typeof statusObj?.code === 'number' && statusObj.code >= 400 && statusObj.code < 600
        ? statusObj.code
        : message.includes('GEMINI_API_KEY')
          ? 500
          : 500;
  return { status, message };
}

function enforceAiCreditGate(req: Request, res: Response, operation: AiOperationType): boolean {
  const session = extractSessionFromRequest(req);
  const agencyId = session?.agencyId || 'agency_1';
  const currentBilling = getAgencyBilling(agencyId);
  const check = consumeAiCredits(currentBilling, operation);

  if (!check.allowed) {
    res.status(402).json({
      error: check.reason || 'AI credit budget limit reached.',
      billing: check.state,
    });
    return false;
  }

  saveAgencyBilling(agencyId, check.state);
  res.setHeader('X-AgentOS-Credits-Used', String(check.state.aiCredits.used));
  res.setHeader('X-AgentOS-Warning-Level', check.warningLevel);
  return true;
}

async function startServer() {
  const app = express();
  app.use(applySecurityHeaders);
  app.use(express.json({ limit: '50mb' }));
  app.use('/api/', createRateLimiter(240, 60_000));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', security: 'hmac-sha256', store: 'active' });
  });

  // --- AUTHENTICATION ENDPOINTS ---
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password, demoRole } = req.body ?? {};
    const store = getServerStore();

    if (demoRole === 'admin' || demoRole === 'agent') {
      const targetEmail = demoRole === 'admin' ? 'admin@agency1.com' : 'moniaros@gmail.com';
      const account = store.accounts.find((a) => a.email === targetEmail);
      if (!account) {
        res.status(404).json({ error: 'Demo account not found.' });
        return;
      }
      const token = signSessionToken({
        userId: account.userId,
        agencyId: account.agencyId,
        email: account.email,
        role: account.role,
      });
      appendChainedAuditLog({
        agencyId: account.agencyId,
        actorName: account.email,
        action: 'session_login',
        targetName: 'Auth Gateway',
        details: `Signed HMAC session issued for ${account.role}.`,
      });
      res.json({
        token,
        account: {
          userId: account.userId,
          agencyId: account.agencyId,
          email: account.email,
          role: account.role,
        },
      });
      return;
    }

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const account = store.accounts.find((a) => a.email.toLowerCase() === normalizedEmail);
    if (!account || !verifyPassword(String(password), account.passwordHash, account.salt)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signSessionToken({
      userId: account.userId,
      agencyId: account.agencyId,
      email: account.email,
      role: account.role,
    });

    appendChainedAuditLog({
      agencyId: account.agencyId,
      actorName: account.email,
      action: 'session_login',
      targetName: 'Auth Gateway',
      details: 'Password PBKDF2 verified and HMAC session issued.',
    });

    res.json({
      token,
      account: {
        userId: account.userId,
        agencyId: account.agencyId,
        email: account.email,
        role: account.role,
      },
    });
  });

  app.get('/api/auth/session', (req: Request, res: Response) => {
    const session = extractSessionFromRequest(req);
    if (!session) {
      res.status(401).json({ authenticated: false });
      return;
    }
    res.json({ authenticated: true, session });
  });

  // --- BILLING & FLEX-BUDGET CREDIT LEDGER ENDPOINTS ---
  app.get('/api/billing/usage', (req: Request, res: Response) => {
    const session = extractSessionFromRequest(req);
    const agencyId = (req.query.agencyId as string) || session?.agencyId || 'agency_1';
    res.json(getAgencyBilling(agencyId));
  });

  app.post('/api/billing/overage', (req: Request, res: Response) => {
    const session = extractSessionFromRequest(req);
    const agencyId = req.body?.agencyId || session?.agencyId || 'agency_1';
    const { isEnabled, monthlyBudgetCap } = req.body ?? {};
    const current = getAgencyBilling(agencyId);
    const nextCap = Math.max(0, Number(monthlyBudgetCap ?? current.overage.monthlyBudgetCap));
    const updated = saveAgencyBilling(agencyId, {
      ...current,
      overage: {
        ...current.overage,
        isEnabled: Boolean(isEnabled),
        monthlyBudgetCap: nextCap,
      },
      updatedAt: new Date().toISOString(),
    });
    appendChainedAuditLog({
      agencyId,
      actorName: session?.email || 'Agency Admin',
      action: 'billing_cap_updated',
      targetName: 'Flex-Budget Ledger',
      details: `Overage ${updated.overage.isEnabled ? 'enabled' : 'disabled'} with cap €${nextCap.toFixed(2)}.`,
    });
    res.json(updated);
  });

  app.post('/api/billing/plan', (req: Request, res: Response) => {
    const session = extractSessionFromRequest(req);
    const agencyId = req.body?.agencyId || session?.agencyId || 'agency_1';
    const planId = req.body?.planId as PlanTierId;
    if (!planId || !PLAN_CATALOG[planId]) {
      res.status(400).json({ error: 'Invalid planId.' });
      return;
    }
    const current = getAgencyBilling(agencyId);
    const updated = saveAgencyBilling(agencyId, changeAgencyPlan(current, planId));
    appendChainedAuditLog({
      agencyId,
      actorName: session?.email || 'Agency Admin',
      action: 'subscription_plan_changed',
      targetName: PLAN_CATALOG[planId].name,
      details: `Upgraded agency plan to ${PLAN_CATALOG[planId].name} (${PLAN_CATALOG[planId].creditLimit} credits).`,
    });
    res.json(updated);
  });

  app.post('/api/billing/simulate', (req: Request, res: Response) => {
    const session = extractSessionFromRequest(req);
    const agencyId = req.body?.agencyId || session?.agencyId || 'agency_1';
    const credits = Number(req.body?.credits ?? 500);
    const current = getAgencyBilling(agencyId);
    const result = consumeAiCredits(current, 'generate', credits);
    if (!result.allowed) {
      res.status(402).json({ error: result.reason, state: result.state, warningLevel: result.warningLevel });
      return;
    }
    const saved = saveAgencyBilling(agencyId, result.state);
    res.json({ state: saved, warningLevel: result.warningLevel, overageEuroCharged: result.overageEuroCharged });
  });

  // --- CRYPTOGRAPHIC AUDIT CHAIN ENDPOINTS ---
  app.get('/api/audit-logs', (req: Request, res: Response) => {
    const session = extractSessionFromRequest(req);
    const agencyId = (req.query.agencyId as string) || session?.agencyId || 'agency_1';
    const store = getServerStore();
    res.json(store.auditChain.filter((item) => item.agencyId === agencyId));
  });

  app.post('/api/audit-logs', (req: Request, res: Response) => {
    const session = extractSessionFromRequest(req);
    const agencyId = req.body?.agencyId || session?.agencyId || 'agency_1';
    const { actorName, action, targetName, details } = req.body ?? {};
    if (!action || !targetName) {
      res.status(400).json({ error: 'Missing required audit log fields.' });
      return;
    }
    const created = appendChainedAuditLog({
      agencyId,
      actorName: actorName || session?.email || 'System',
      action,
      targetName,
      details: details || '',
    });
    res.status(201).json(created);
  });

  // --- UNIFIED MULTI-TENANT COLLECTION SYNC ENDPOINTS ---
  const ALLOWED_COLLECTIONS = new Set([
    'customers',
    'leads',
    'acord_policies',
    'findings',
    'gap_analyses',
    'inquiries',
    'opportunities',
    'prospects',
    'interactions',
    'conversions',
    'tasks',
    'campaigns',
    'automation_rules',
    'automation_events',
    'ftnol',
    'service_requests',
    'news',
    'testimonials',
    'users',
  ]);

  app.get('/api/store/:collection', (req: Request, res: Response) => {
    const rawParam = req.params.collection;
    const collection = Array.isArray(rawParam) ? rawParam[0] : String(rawParam || '');
    if (!ALLOWED_COLLECTIONS.has(collection)) {
      res.status(400).json({ error: `Unsupported collection: ${collection}` });
      return;
    }
    const items = getCollectionData(collection);
    res.json({ initialized: items !== null, items: items ?? [] });
  });

  app.put('/api/store/:collection', (req: Request, res: Response) => {
    const rawParam = req.params.collection;
    const collection = Array.isArray(rawParam) ? rawParam[0] : String(rawParam || '');
    if (!ALLOWED_COLLECTIONS.has(collection)) {
      res.status(400).json({ error: `Unsupported collection: ${collection}` });
      return;
    }
    const items = req.body?.items;
    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'Expected items array in body.' });
      return;
    }
    const saved = setCollectionData(collection, items);
    res.json({ ok: true, count: saved.length });
  });

  // --- SERVER-SIDE GEMINI AI ENDPOINTS (WITH CREDIT LEDGER GATE) ---
  app.post('/api/gemini/generate', async (req: Request, res: Response) => {
    try {
      if (!enforceAiCreditGate(req, res, 'generate')) return;
      const ai = getGenAIClient();
      const { contents, systemInstruction, responseMimeType } = req.body ?? {};

      if (!contents) {
        res.status(400).json({ error: 'Missing contents parameter.' });
        return;
      }

      const config: Record<string, unknown> = {};
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }
      if (responseMimeType) {
        config.responseMimeType = responseMimeType;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      res.json({ text: response.text ?? '' });
    } catch (err) {
      console.error('Gemini generate error:', err);
      const { status, message } = formatError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/gemini/generate-image', async (req: Request, res: Response) => {
    try {
      if (!enforceAiCreditGate(req, res, 'generate-image')) return;
      const ai = getGenAIClient();
      const { prompt, base64Data, mimeType, aspectRatio = '1:1' } = req.body ?? {};

      if (!prompt) {
        res.status(400).json({ error: 'Missing prompt parameter.' });
        return;
      }

      const parts: Array<Record<string, unknown>> = [];
      if (base64Data && mimeType) {
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType,
          },
        });
      }
      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio,
          },
        },
      });

      let imageUrl: string | null = null;
      let textOutput = '';

      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data && !imageUrl) {
          const outMime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${outMime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textOutput += part.text;
        }
      }

      res.json({ imageUrl, text: textOutput });
    } catch (err) {
      console.error('Gemini image generation error:', err);
      const { status, message } = formatError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/gemini/parse-policy', async (req: Request, res: Response) => {
    try {
      if (!enforceAiCreditGate(req, res, 'parse-policy')) return;
      const ai = getGenAIClient();
      const { base64Data, mimeType, prompt } = req.body ?? {};

      if (!base64Data || !mimeType) {
        res.status(400).json({ error: 'Missing document data or mimeType.' });
        return;
      }

      const defaultPrompt = `
        You are an expert insurance policy parser. Analyze the provided document (image or PDF) and extract the policy details into a structured JSON format.

        Extract the following fields accurately:
        - Policy Number
        - Insurer Name
        - Policyholder Name and Address
        - Effective Date and Expiration Date (Format: YYYY-MM-DD)
        - Insured Items (e.g., Vehicle description, Property address)
        - Coverages (Type, Limit, Deductible, Premium if available)

        If specific values are missing, use null or an empty string. Do not hallucinate data.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            { text: prompt || defaultPrompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              policyNumber: { type: Type.STRING },
              insurer: { type: Type.STRING },
              policyholder: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  address: { type: Type.STRING },
                },
                required: ['name', 'address'],
              },
              effectiveDate: {
                type: Type.STRING,
                description: 'The policy start date in YYYY-MM-DD format.',
              },
              expirationDate: {
                type: Type.STRING,
                description: 'The policy end date in YYYY-MM-DD format.',
              },
              insuredItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    description: { type: Type.STRING },
                    coverages: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          type: { type: Type.STRING },
                          limit: { type: Type.STRING },
                          deductible: { type: Type.STRING },
                          premium: { type: Type.NUMBER },
                        },
                        required: ['type', 'limit'],
                      },
                    },
                  },
                  required: ['id', 'description', 'coverages'],
                },
              },
            },
            required: [
              'policyNumber',
              'insurer',
              'policyholder',
              'effectiveDate',
              'expirationDate',
              'insuredItems',
            ],
          },
        },
      });

      res.json({ text: response.text ?? '' });
    } catch (err) {
      console.error('Gemini parse-policy error:', err);
      const { status, message } = formatError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/gemini/analyze-gaps', async (req: Request, res: Response) => {
    try {
      if (!enforceAiCreditGate(req, res, 'analyze-gaps')) return;
      const ai = getGenAIClient();
      const { prompt } = req.body ?? {};

      if (!prompt) {
        res.status(400).json({ error: 'Missing prompt parameter.' });
        return;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: {
                type: Type.NUMBER,
                description: 'A score from 0 (safe) to 100 (risky).',
              },
              summary: { type: Type.STRING },
              gaps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    area: { type: Type.STRING },
                    current: { type: Type.STRING },
                    recommended: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    priority: {
                      type: Type.STRING,
                      enum: ['Critical', 'High', 'Medium', 'Low'],
                    },
                    financialImpact: { type: Type.STRING },
                    costOfImplementation: { type: Type.STRING },
                    costOfInaction: { type: Type.STRING },
                    salesScript: { type: Type.STRING },
                  },
                  required: [
                    'area',
                    'current',
                    'recommended',
                    'reason',
                    'priority',
                    'financialImpact',
                    'costOfImplementation',
                    'salesScript',
                  ],
                },
              },
              upsell_opportunities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    product: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                    benefit: { type: Type.STRING },
                    priority: {
                      type: Type.STRING,
                      enum: ['Critical', 'High', 'Medium', 'Low'],
                    },
                    financialImpact: { type: Type.STRING },
                    costOfImplementation: { type: Type.STRING },
                    salesScript: { type: Type.STRING },
                  },
                  required: ['product', 'recommendation', 'benefit', 'salesScript'],
                },
              },
              cross_sell_opportunities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    product: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                    benefit: { type: Type.STRING },
                    priority: {
                      type: Type.STRING,
                      enum: ['Critical', 'High', 'Medium', 'Low'],
                    },
                    financialImpact: { type: Type.STRING },
                    costOfImplementation: { type: Type.STRING },
                    salesScript: { type: Type.STRING },
                  },
                  required: ['product', 'recommendation', 'benefit', 'salesScript'],
                },
              },
            },
            required: [
              'riskScore',
              'summary',
              'gaps',
              'upsell_opportunities',
              'cross_sell_opportunities',
            ],
          },
        },
      });

      res.json({ text: response.text ?? '' });
    } catch (err) {
      console.error('Gemini analyze-gaps error:', err);
      const { status, message } = formatError(err);
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
