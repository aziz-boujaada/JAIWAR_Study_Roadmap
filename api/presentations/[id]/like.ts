import { getDatabase } from '../../_db.js';

function readId(queryValue: string | string[] | undefined) {
  if (Array.isArray(queryValue)) {
    return queryValue[0];
  }

  return queryValue;
}

function parseBody(body: unknown): { liked?: boolean } {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as { liked?: boolean };
    } catch {
      return {};
    }
  }

  return (body as { liked?: boolean }) ?? {};
}

export default async function handler(request: any, response: any) {
  const database = await getDatabase();
  const id = readId(request.query.id);

  if (!id) {
    response.status(400).json({ message: 'Presentation id is required' });
    return;
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const existing = await database.execute({
    sql: 'SELECT likes FROM presentations WHERE id = ?',
    args: [id],
  });

  if (existing.rows.length === 0) {
    response.status(404).json({ message: 'Presentation not found' });
    return;
  }

  const body = parseBody(request.body);
  const isLikeRequest = body.liked === true;
  const currentLikes = Number(existing.rows[0].likes ?? 0);
  const nextLikes = isLikeRequest ? currentLikes + 1 : Math.max(0, currentLikes - 1);

  await database.execute({
    sql: 'UPDATE presentations SET likes = ? WHERE id = ?',
    args: [nextLikes, id],
  });

  response.status(200).json({ likes: nextLikes });
}