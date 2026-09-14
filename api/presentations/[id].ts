import type { Presentation } from '../../src/types';
import { getDatabase, presentationColumns, presentationToArgs, rowToPresentation } from '../_db.js';

function parseBody(body: unknown): Presentation {
  if (typeof body === 'string') {
    return JSON.parse(body) as Presentation;
  }

  return body as Presentation;
}

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

  if (request.method === 'GET') {
    const result = await database.execute({
      sql: `SELECT ${presentationColumns} FROM presentations WHERE id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) {
      response.status(404).json({ message: 'Presentation not found' });
      return;
    }

    response.status(200).json(rowToPresentation(result.rows[0]));
    return;
  }

  if (request.method === 'PUT') {
    const existing = await database.execute({
      sql: 'SELECT sortOrder FROM presentations WHERE id = ?',
      args: [id],
    });

    if (existing.rows.length === 0) {
      response.status(404).json({ message: 'Presentation not found' });
      return;
    }

    const presentation = parseBody(request.body);
    const sortOrder = Number.isFinite(presentation.order)
      ? presentation.order
      : Number(existing.rows[0].sortOrder ?? 0);

    await database.execute({
      sql: `
        UPDATE presentations SET
          title = ?,
          author = ?,
          category = ?,
          date = ?,
          status = ?,
          shortDescription = ?,
          summary = ?,
          importantPoints = ?,
          concepts = ?,
          codeExamples = ?,
          sortOrder = ?
        WHERE id = ?
      `,
      args: [...presentationToArgs({ ...presentation, id }, sortOrder).slice(1), id],
    });

    response.status(200).json({ ...presentation, id, order: sortOrder });
    return;
  }

  if (request.method === 'DELETE') {
    const result = await database.execute({
      sql: 'DELETE FROM presentations WHERE id = ?',
      args: [id],
    });

    if (result.rowsAffected === 0) {
      response.status(404).json({ message: 'Presentation not found' });
      return;
    }

    response.status(204).end();
    return;
  }

  response.setHeader('Allow', 'GET, PUT, DELETE');
  response.status(405).json({ message: 'Method not allowed' });
}