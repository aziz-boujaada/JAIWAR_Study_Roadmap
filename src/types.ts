export type Status = 'Planned' | 'In Progress' | 'Completed';

export interface Concept {
  name: string;
  definition: string;
  advantages?: string;
  disadvantages?: string;
  whenToUse?: string;
}

export interface CodeExample {
  title: string;
  language: string;
  code: string;
}

export interface Comment {
  id: string;
  presentationId: string;
  author: string;
  text: string;
  date: string;
}

export interface Presentation {
  id: string;
  title: string;
  author: string;
  category: string;
  date: string;
  status: Status;
  shortDescription: string;
  summary: string;
  importantPoints: string[];
  concepts: Concept[];
  codeExamples: CodeExample[];
  order: number;
  presentationLink?: string;
  likes: number;
}
