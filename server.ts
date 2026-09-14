import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Presentation } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const databaseDirectory = join(__dirname, 'data');
const databasePath = join(databaseDirectory, 'presentations.sqlite');
const clientDirectory = join(__dirname, 'dist');
const clientIndexPath = join(clientDirectory, 'index.html');

mkdirSync(databaseDirectory, { recursive: true });

const database = new Database(databasePath);

database.exec(`
  CREATE TABLE IF NOT EXISTS presentations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    shortDescription TEXT NOT NULL,
    summary TEXT NOT NULL,
    importantPoints TEXT NOT NULL,
    concepts TEXT NOT NULL,
    codeExamples TEXT NOT NULL,
    sortOrder INTEGER NOT NULL
  )
`);

const selectAllPresentations = database.prepare(
  'SELECT * FROM presentations ORDER BY sortOrder ASC, date DESC'
);
const selectPresentationById = database.prepare('SELECT * FROM presentations WHERE id = ?');
const insertPresentation = database.prepare(`
  INSERT INTO presentations (
    id,
    title,
    author,
    category,
    date,
    status,
    shortDescription,
    summary,
    importantPoints,
    concepts,
    codeExamples,
    sortOrder
  ) VALUES (@id, @title, @author, @category, @date, @status, @shortDescription, @summary, @importantPoints, @concepts, @codeExamples, @sortOrder)
`);
const updatePresentation = database.prepare(`
  UPDATE presentations SET
    title = @title,
    author = @author,
    category = @category,
    date = @date,
    status = @status,
    shortDescription = @shortDescription,
    summary = @summary,
    importantPoints = @importantPoints,
    concepts = @concepts,
    codeExamples = @codeExamples,
    sortOrder = @sortOrder
  WHERE id = @id
`);
const deletePresentation = database.prepare('DELETE FROM presentations WHERE id = ?');
const selectMaxSortOrder = database.prepare('SELECT COALESCE(MAX(sortOrder), 0) AS maxSortOrder FROM presentations');

function toPresentation(row: any): Presentation {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    category: row.category,
    date: row.date,
    status: row.status,
    shortDescription: row.shortDescription,
    summary: row.summary,
    importantPoints: JSON.parse(row.importantPoints),
    concepts: JSON.parse(row.concepts),
    codeExamples: JSON.parse(row.codeExamples),
    order: row.sortOrder,
  };
}

function toDatabaseRow(presentation: Presentation, sortOrder: number) {
  return {
    id: presentation.id,
    title: presentation.title,
    author: presentation.author,
    category: presentation.category,
    date: presentation.date,
    status: presentation.status,
    shortDescription: presentation.shortDescription,
    summary: presentation.summary,
    importantPoints: JSON.stringify(presentation.importantPoints),
    concepts: JSON.stringify(presentation.concepts),
    codeExamples: JSON.stringify(presentation.codeExamples),
    sortOrder,
  };
}

const app = express();

app.use(cors());
app.use(express.json());

if (existsSync(clientIndexPath)) {
  app.use(express.static(clientDirectory));
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.get('/api/presentations', (_request, response) => {
  const rows = selectAllPresentations.all();
  response.json(rows.map(toPresentation));
});

app.get('/api/presentations/:id', (request, response) => {
  const row = selectPresentationById.get(request.params.id);

  if (!row) {
    response.status(404).json({ message: 'Presentation not found' });
    return;
  }

  response.json(toPresentation(row));
});

app.post('/api/presentations', (request, response) => {
  const presentation = request.body as Presentation;
  const nextSortOrder = selectMaxSortOrder.get() as { maxSortOrder: number };
  const sortOrder = Number.isFinite(presentation.order) ? presentation.order : nextSortOrder.maxSortOrder + 1;

  const row = toDatabaseRow(
    {
      ...presentation,
      order: sortOrder,
    },
    sortOrder
  );

  insertPresentation.run(row);
  response.status(201).json(toPresentation(row));
});

app.put('/api/presentations/:id', (request, response) => {
  const presentation = request.body as Presentation;
  const row = selectPresentationById.get(request.params.id) as { sortOrder: number } | undefined;

  if (!row) {
    response.status(404).json({ message: 'Presentation not found' });
    return;
  }

  const updatedRow = toDatabaseRow(
    {
      ...presentation,
      id: request.params.id,
    },
    Number.isFinite(presentation.order) ? presentation.order : row.sortOrder
  );

  updatePresentation.run(updatedRow);
  response.json(toPresentation(updatedRow));
});

app.delete('/api/presentations/:id', (request, response) => {
  const result = deletePresentation.run(request.params.id);

  if (result.changes === 0) {
    response.status(404).json({ message: 'Presentation not found' });
    return;
  }

  response.status(204).send();
});

if (existsSync(clientIndexPath)) {
  app.get('*', (_request, response) => {
    response.sendFile(clientIndexPath);
  });
}

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});