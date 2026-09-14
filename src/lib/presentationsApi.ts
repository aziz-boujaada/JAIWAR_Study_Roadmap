import { Presentation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchPresentations() {
  return requestJson<Presentation[]>('/api/presentations');
}

export function createPresentation(presentation: Presentation) {
  return requestJson<Presentation>('/api/presentations', {
    method: 'POST',
    body: JSON.stringify(presentation),
  });
}