import type { Comment } from '../../../src/types';
import { getDatabase, commentColumns, rowToComment } from '../../_db.js';

function parseBody(body: unknown): Partial<Comment> {
  if (typeof body === 'string') {
    return JSON.parse(body) as Partial<Comment>;
  }

  return body as Partial<Comment>;
}

function readId(queryValue: string | string[] | undefined) {
  if (Array.isArray(queryValue)) {
    return queryValue[0];
  }

  return queryValue;
}

export default async function handler(request: any, response: any) {
  const database = await getDatabase();
  const presentationId = readId(request.query.id);

  if (!presentationId) {
    response.status(400).json({ message: 'Presentation id is required' });
    return;
  }

  const presentation = await database.execute({
    sql: 'SELECT id FROM presentations WHERE id = ?',
    args: [presentationId],
  });

  if (presentation.rows.length === 0) {
    response.status(404).json({ message: 'Presentation not found' });
    return;
  }

  if (request.method === 'GET') {
    const result = await database.execute({
      sql: `SELECT ${commentColumns} FROM comments WHERE presentationId = ? ORDER BY date DESC`,
      args: [presentationId],
    });
    response.status(200).json(result.rows.map(rowToComment));
    return;
  }

  if (request.method === 'POST') {
    const comment = parseBody(request.body);
    const newComment: Comment = {
      id: comment.id ?? Date.now().toString(),
      presentationId,
      author: comment.author?.trim() || 'Anonymous',
      text: comment.text?.trim() || '',
      date: comment.date ?? new Date().toISOString(),
    };

    if (!newComment.text) {
      response.status(400).json({ message: 'Comment text is required' });
      return;
    }

    await database.execute({
      sql: `INSERT INTO comments (${commentColumns}) VALUES (?, ?, ?, ?, ?)`,
      args: [newComment.id, newComment.presentationId, newComment.author, newComment.text, newComment.date],
    });

    response.status(201).json(newComment);
    return;
  }

  response.setHeader('Allow', 'GET, POST');
  response.status(405).json({ message: 'Method not allowed' });
}