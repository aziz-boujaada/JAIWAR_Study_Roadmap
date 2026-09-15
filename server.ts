import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Presentation, Comment } from './src/types';

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
    sortOrder INTEGER NOT NULL,
    presentationLink TEXT DEFAULT '',
    likes INTEGER DEFAULT 0
  )
`);

database.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    presentationId TEXT NOT NULL,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (presentationId) REFERENCES presentations(id) ON DELETE CASCADE
  )
`);

const presentationColumns = database.prepare('PRAGMA table_info(presentations)').all() as { name: string }[];
const existingColumnNames = new Set(presentationColumns.map((column) => column.name));

if (!existingColumnNames.has('presentationLink')) {
  database.exec('ALTER TABLE presentations ADD COLUMN presentationLink TEXT DEFAULT \'\'');
}

if (!existingColumnNames.has('likes')) {
  database.exec('ALTER TABLE presentations ADD COLUMN likes INTEGER DEFAULT 0');
}

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
    sortOrder,
    presentationLink,
    likes
  ) VALUES (@id, @title, @author, @category, @date, @status, @shortDescription, @summary, @importantPoints, @concepts, @codeExamples, @sortOrder, @presentationLink, @likes)
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
    sortOrder = @sortOrder,
    presentationLink = @presentationLink,
    likes = @likes
  WHERE id = @id
`);
const deletePresentation = database.prepare('DELETE FROM presentations WHERE id = ?');
const selectMaxSortOrder = database.prepare('SELECT COALESCE(MAX(sortOrder), 0) AS maxSortOrder FROM presentations');

const selectCommentsByPresentation = database.prepare('SELECT * FROM comments WHERE presentationId = ? ORDER BY date DESC');
const selectCommentById = database.prepare('SELECT * FROM comments WHERE id = ?');
const insertComment = database.prepare(`
  INSERT INTO comments (id, presentationId, author, text, date)
  VALUES (@id, @presentationId, @author, @text, @date)
`);
const updateComment = database.prepare(`
  UPDATE comments SET author = @author, text = @text WHERE id = @id
`);
const deleteComment = database.prepare('DELETE FROM comments WHERE id = ?');

const incrementLikes = database.prepare('UPDATE presentations SET likes = likes + 1 WHERE id = ?');
const decrementLikes = database.prepare('UPDATE presentations SET likes = likes - 1 WHERE id = ?');

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
    presentationLink: row.presentationLink ?? '',
    likes: row.likes ?? 0,
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
    presentationLink: presentation.presentationLink ?? '',
    likes: presentation.likes ?? 0,
  };
}

function toComment(row: any): Comment {
  return {
    id: row.id,
    presentationId: row.presentationId,
    author: row.author,
    text: row.text,
    date: row.date,
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
  const existingPresentation = selectPresentationById.get(request.params.id);

  if (!existingPresentation) {
    response.status(404).json({ message: 'Presentation not found' });
    return;
  }

  const result = deletePresentation.run(request.params.id);

  const deletedPresentation = selectPresentationById.get(request.params.id);

  if (deletedPresentation) {
    response.status(500).json({ message: 'Delete failed' });
    return;
  }

  response.status(204).send();
});

app.get('/api/presentations/:id/comments', (request, response) => {
  const presentation = selectPresentationById.get(request.params.id);

  if (!presentation) {
    response.status(404).json({ message: 'Presentation not found' });
    return;
  }

  const rows = selectCommentsByPresentation.all(request.params.id);
  response.json(rows.map(toComment));
});

app.post('/api/presentations/:id/comments', (request, response) => {
  const presentation = selectPresentationById.get(request.params.id);

  if (!presentation) {
    response.status(404).json({ message: 'Presentation not found' });
    return;
  }

  const comment: Partial<Comment> = request.body ?? {};
  const newComment: Comment = {
    id: comment.id ?? Date.now().toString(),
    presentationId: request.params.id,
    author: comment.author?.trim() || 'Anonymous',
    text: comment.text?.trim() || '',
    date: comment.date ?? new Date().toISOString(),
  };

  if (!newComment.text) {
    response.status(400).json({ message: 'Comment text is required' });
    return;
  }

  insertComment.run(newComment);
  response.status(201).json(newComment);
});

app.put('/api/presentations/:id/comments/:commentId', (request, response) => {
  const existingComment = selectCommentById.get(request.params.commentId) as Comment | undefined;

  if (!existingComment) {
    response.status(404).json({ message: 'Comment not found' });
    return;
  }

  const body: Partial<Comment> = request.body ?? {};
  const updatedComment = {
    ...toComment(existingComment),
    author: body.author?.trim() || existingComment.author,
    text: body.text?.trim() || '',
  };

  if (!updatedComment.text) {
    response.status(400).json({ message: 'Comment text is required' });
    return;
  }

  updateComment.run({ id: updatedComment.id, author: updatedComment.author, text: updatedComment.text });
  response.json(updatedComment);
});

app.delete('/api/presentations/:id/comments/:commentId', (request, response) => {
  const existingComment = selectCommentById.get(request.params.commentId);

  if (!existingComment) {
    response.status(404).json({ message: 'Comment not found' });
    return;
  }

  deleteComment.run(request.params.commentId);
  response.status(204).send();
});

app.post('/api/presentations/:id/like', (request, response) => {
  const existingPresentation = selectPresentationById.get(request.params.id);

  if (!existingPresentation) {
    response.status(404).json({ message: 'Presentation not found' });
    return;
  }

  incrementLikes.run(request.params.id);
  const updated = selectPresentationById.get(request.params.id) as { likes: number };
  response.json({ likes: updated.likes });
});

app.post('/api/presentations/:id/unlike', (request, response) => {
  const existingPresentation = selectPresentationById.get(request.params.id);

  if (!existingPresentation) {
    response.status(404).json({ message: 'Presentation not found' });
    return;
  }

  const current = existingPresentation as { likes: number };

  if ((current.likes ?? 0) > 0) {
    decrementLikes.run(request.params.id);
  }

  const updated = selectPresentationById.get(request.params.id) as { likes: number };
  response.json({ likes: updated.likes });
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