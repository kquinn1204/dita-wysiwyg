import { BodyElement } from './DitaElements';

export interface Topic {
  readonly id: string;
  readonly title: string;
  readonly body: TopicBody;
  readonly metadata: TopicMetadata;
  readonly topicType?: 'topic' | 'task' | 'concept' | 'reference';
}

export interface TopicMetadata {
  readonly createdAt: string;
  readonly modifiedAt: string;
  readonly ditaVersion: '1.3';
}

export interface TopicBody {
  readonly content: BodyElement[];
}

export function createEmptyTopic(): Topic {
  const now = new Date().toISOString();
  return {
    id: `topic-${Date.now()}`,
    title: '',
    body: { content: [] },
    metadata: {
      createdAt: now,
      modifiedAt: now,
      ditaVersion: '1.3',
    },
  };
}
