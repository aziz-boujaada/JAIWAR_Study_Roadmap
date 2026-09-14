import type { Presentation } from '../src/types';
import { getDatabase, presentationColumns, presentationToArgs, rowToPresentation } from './_db.js';

function parseBody(body: unknown): Presentation {
  if (typeof body === 'string') {
    return JSON.parse(body) as Presentation;
  }

  return body as Presentation;
}

export default async function handler(request: any, response: any) {
  const database = await getDatabase();

  if (request.method === 'GET') {
    const result = await database.execute(`SELECT ${presentationColumns} FROM presentations ORDER BY sortOrder ASC, date DESC`);
    response.status(200).json(result.rows.map(rowToPresentation));
    return;
  }

  if (request.method === 'POST') {
    const presentation = parseBody(request.body);
    const sortOrderResult = await database.execute('SELECT COALESCE(MAX(sortOrder), 0) AS maxSortOrder FROM presentations');
    const currentMaxSortOrder = Number(sortOrderResult.rows[0]?.maxSortOrder ?? 0);
    const sortOrder = Number.isFinite(presentation.order) ? presentation.order : currentMaxSortOrder + 1;

    await database.execute({
      sql: `INSERT INTO presentations (${presentationColumns}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: presentationToArgs({ ...presentation, order: sortOrder }, sortOrder),
    });

    response.status(201).json({ ...presentation, order: sortOrder });
    return;
  }

  response.setHeader('Allow', 'GET, POST');
  response.status(405).json({ message: 'Method not allowed' });
}