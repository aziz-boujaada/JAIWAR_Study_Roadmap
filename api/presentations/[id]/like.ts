import { getDatabase } from '../../_db.js';

function readId(queryValue: string | string[] | undefined) {
  if (Array.isArray(queryValue)) {
    return queryValue[0];
  }

  return queryValue;
}

export default async function handler(request: any, response: any) {
  const database = await getDatabase();
  const id = readId(request.query.id);

  if (!id) {
    response.status(400).json({ message: 'Presentation id is required' });
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

  const currentLikes = Number(existing.rows[0].likes ?? 0);
  const shouldLike = request.body?.liked !== false && request.method === 'POST';
  const nextLikes = shouldLike ? currentLikes + 1 : Math.max(0, currentLikes - 1);

  await database.execute({
    sql: 'UPDATE presentations SET likes = ? WHERE id = ?',
    args: [nextLikes, id],
  });

  response.status(200).json({ likes: nextLikes });
}