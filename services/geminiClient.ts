import type { DetailedPolicy, GapAnalysisResult } from '../types';

export interface GenerateTextOptions {
  contents: unknown;
  systemInstruction?: string;
  responseMimeType?: string;
}

export interface GenerateImageOptions {
  prompt: string;
  base64Data?: string;
  mimeType?: string;
  aspectRatio?: string;
}

export interface GenerateImageResponse {
  imageUrl: string | null;
  text: string;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('agentos_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (typeof window !== 'undefined' && response.headers.get('X-AgentOS-Credits-Used')) {
    window.dispatchEvent(
      new CustomEvent('agentos:credits-updated', {
        detail: {
          used: Number(response.headers.get('X-AgentOS-Credits-Used')),
          warningLevel: response.headers.get('X-AgentOS-Warning-Level') || 'none',
        },
      })
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data?.error || `Request failed with status ${response.status}`) as Error & {
      status?: number;
    };
    err.status = response.status;
    throw err;
  }
  return data as T;
}

export async function generateGeminiContent(options: GenerateTextOptions): Promise<string> {
  const result = await postJson<{ text: string }>('/api/gemini/generate', options);
  return result.text ?? '';
}

export async function generateGeminiImage(options: GenerateImageOptions): Promise<GenerateImageResponse> {
  return postJson<GenerateImageResponse>('/api/gemini/generate-image', options);
}

export async function parsePolicyDocument(params: {
  base64Data: string;
  mimeType: string;
  prompt?: string;
}): Promise<DetailedPolicy> {
  const result = await postJson<{ text: string }>('/api/gemini/parse-policy', params);
  if (!result.text) {
    throw new Error('No data returned from AI');
  }
  const cleaned = result.text
    .replace(/^```json\s*/, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '');
  return JSON.parse(cleaned) as DetailedPolicy;
}

export async function analyzePolicyGaps(prompt: string): Promise<GapAnalysisResult> {
  const result = await postJson<{ text: string }>('/api/gemini/analyze-gaps', { prompt });
  if (!result.text) {
    throw new Error('No response from AI');
  }
  const cleaned = result.text
    .replace(/^```json\s*/, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '');
  return JSON.parse(cleaned) as GapAnalysisResult;
}
