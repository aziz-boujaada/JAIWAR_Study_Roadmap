import type { Comment } from '../../../../src/types';
import { getDatabase, commentColumns, rowToComment } from '../../../_db.js';

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
  const commentId = readId(request.query.commentId);

  if (!presentationId || !commentId) {
    response.status(400).json({ message: 'Presentation id and comment id are required' });
    return;
  }

  const existing = await database.execute({
    sql: `SELECT ${commentColumns} FROM comments WHERE id = ?`,
    args: [commentId],
  });

  if (existing.rows.length === 0) {
    response.status(404).json({ message: 'Comment not found' });
    return;
  }

  if (request.method === 'PUT') {
    const comment = parseBody(request.body);
    const currentComment = rowToComment(existing.rows[0]);
    const author = comment.author?.trim() || currentComment.author;
    const text = comment.text?.trim() || '';

    if (!text) {
      response.status(400).json({ message: 'Comment text is required' });
      return;
    }

    await database.execute({
      sql: 'UPDATE comments SET author = ?, text = ? WHERE id = ?',
      args: [author, text, commentId],
    });

    response.status(200).json({ ...currentComment, author, text });
    return;
  }

  if (request.method === 'DELETE') {
    await database.execute({
      sql: 'DELETE FROM comments WHERE id = ?',
      args: [commentId],
    });

    response.status(204).end();
    return;
  }

  response.setHeader('Allow', 'PUT, DELETE');
  response.status(405).json({ message: 'Method not allowed' });
}