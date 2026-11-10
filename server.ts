import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // General text / JSON / multimodal generation endpoint
  app.post('/api/gemini/generate', async (req: Request, res: Response) => {
    try {
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

  // Image generation & editing endpoint
  app.post('/api/gemini/generate-image', async (req: Request, res: Response) => {
    try {
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

  // Structured insurance policy parser endpoint
  app.post('/api/gemini/parse-policy', async (req: Request, res: Response) => {
    try {
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

  // Structured insurance gap analysis endpoint
  app.post('/api/gemini/analyze-gaps', async (req: Request, res: Response) => {
    try {
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
                      enum: ['High', 'Medium', 'Low'],
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
                      enum: ['High', 'Medium', 'Low'],
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
