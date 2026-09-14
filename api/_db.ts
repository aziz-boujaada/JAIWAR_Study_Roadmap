import { createClient, type Client } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Presentation } from '../src/types';

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
    sortOrder INTEGER NOT NULL
  )
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
    schemaReady = client.execute(schemaSql).then(() => undefined);
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
  ];
}

export const presentationColumns =
  'id, title, author, category, date, status, shortDescription, summary, importantPoints, concepts, codeExamples, sortOrder';