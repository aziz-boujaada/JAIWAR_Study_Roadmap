import { createClient, type Client } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Presentation, Comment } from '../src/types';

const schemaSql = `
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
  );
  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    presentationId TEXT NOT NULL,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (presentationId) REFERENCES presentations(id) ON DELETE CASCADE
  );
`;

const migrationSql = `
  ALTER TABLE presentations ADD COLUMN presentationLink TEXT DEFAULT '';
  ALTER TABLE presentations ADD COLUMN likes INTEGER DEFAULT 0;
`;

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

function createDatabaseClient() {
  const databaseUrl = process.env.TURSO_DATABASE_URL;

  if (databaseUrl) {
    return createClient({
      url: databaseUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  if (process.env.VERCEL === '1') {
    throw new Error('TURSO_DATABASE_URL is required when deploying to Vercel.');
  }

  const dataDirectory = join(process.cwd(), 'data');
  mkdirSync(dataDirectory, { recursive: true });

  return createClient({
    url: `file:${join(dataDirectory, 'presentations.sqlite')}`,
  });
}

export async function getDatabase() {
  if (!client) {
    client = createDatabaseClient();
  }

  if (!schemaReady) {
    schemaReady = (async () => {
      await client!.execute(schemaSql);

      const tableInfo = await client!.execute('PRAGMA table_info(presentations)');
      const existingColumnNames = new Set(tableInfo.rows.map((column) => column.name));

      if (!existingColumnNames.has('presentationLink') || !existingColumnNames.has('likes')) {
        const migrations: string[] = [];

        if (!existingColumnNames.has('presentationLink')) {
          migrations.push("ALTER TABLE presentations ADD COLUMN presentationLink TEXT DEFAULT ''");
        }

        if (!existingColumnNames.has('likes')) {
          migrations.push('ALTER TABLE presentations ADD COLUMN likes INTEGER DEFAULT 0');
        }

        await client!.batch(migrations.map((sql) => ({ sql, args: [] })));
      }
    })();
  }

  await schemaReady;
  return client;
}

export function rowToPresentation(row: any): Presentation {
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

export function presentationToArgs(presentation: Presentation, sortOrder: number) {
  return [
    presentation.id,
    presentation.title,
    presentation.author,
    presentation.category,
    presentation.date,
    presentation.status,
    presentation.shortDescription,
    presentation.summary,
    JSON.stringify(presentation.importantPoints),
    JSON.stringify(presentation.concepts),
    JSON.stringify(presentation.codeExamples),
    sortOrder,
    presentation.presentationLink ?? '',
    presentation.likes ?? 0,
  ];
}

export function rowToComment(row: any): Comment {
  return {
    id: row.id,
    presentationId: row.presentationId,
    author: row.author,
    text: row.text,
    date: row.date,
  };
}

export const presentationColumns =
  'id, title, author, category, date, status, shortDescription, summary, importantPoints, concepts, codeExamples, sortOrder, presentationLink, likes';

export const commentColumns = 'id, presentationId, author, text, date';