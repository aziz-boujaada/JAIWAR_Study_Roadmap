import { Presentation, Comment } from '../types';

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

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
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

export function updatePresentation(presentation: Presentation) {
  return requestJson<Presentation>(`/api/presentations/${presentation.id}`, {
    method: 'PUT',
    body: JSON.stringify(presentation),
  });
}

export function deletePresentation(id: string) {
  return requestJson<void>(`/api/presentations/${id}`, {
    method: 'DELETE',
  });
}

export function fetchComments(presentationId: string) {
  return requestJson<Comment[]>(`/api/presentations/${presentationId}/comments`);
}

export function addComment(presentationId: string, comment: Partial<Comment>) {
  return requestJson<Comment>(`/api/presentations/${presentationId}/comments`, {
    method: 'POST',
    body: JSON.stringify(comment),
  });
}

export function updateComment(presentationId: string, comment: Comment) {
  return requestJson<Comment>(`/api/presentations/${presentationId}/comments/${comment.id}`, {
    method: 'PUT',
    body: JSON.stringify(comment),
  });
}

export function deleteComment(presentationId: string, commentId: string) {
  return requestJson<void>(`/api/presentations/${presentationId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}

export function likePresentation(presentationId: string, liked: boolean) {
  return requestJson<{ likes: number }>(`/api/presentations/${presentationId}/like`, {
    method: 'POST',
    body: JSON.stringify({ liked }),
  });
}