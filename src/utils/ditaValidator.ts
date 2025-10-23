import { Topic, TopicBody } from '../models/Topic';
import { DitaMap, MapNode } from '../models/Map';
import { BodyElement } from '../models/DitaElements';

// Type guard functions for DITA validation

export function isValidTopic(value: unknown): value is Topic {
  if (typeof value !== 'object' || value === null) return false;
  const topic = value as Topic;

  return (
    typeof topic.id === 'string' &&
    typeof topic.title === 'string' &&
    topic.title.length > 0 &&
    isValidTopicBody(topic.body) &&
    isValidTopicMetadata(topic.metadata)
  );
}

function isValidTopicBody(body: unknown): body is TopicBody {
  if (typeof body !== 'object' || body === null) return false;
  const topicBody = body as TopicBody;

  return (
    Array.isArray(topicBody.content) &&
    topicBody.content.every(isValidBodyElement)
  );
}

function isValidBodyElement(element: unknown): element is BodyElement {
  if (typeof element !== 'object' || element === null) return false;

  const el = element as any;

  if (el.type === 'paragraph') {
    return typeof el.id === 'string' && typeof el.content === 'string';
  }

  if (el.type === 'unorderedList') {
    return (
      typeof el.id === 'string' &&
      Array.isArray(el.items) &&
      el.items.length > 0 &&
      el.items.every(
        (item: any) =>
          item.type === 'listItem' &&
          typeof item.id === 'string' &&
          typeof item.content === 'string'
      )
    );
  }

  return false;
}

function isValidTopicMetadata(metadata: unknown): boolean {
  if (typeof metadata !== 'object' || metadata === null) return false;
  const meta = metadata as any;

  return (
    typeof meta.createdAt === 'string' &&
    typeof meta.modifiedAt === 'string' &&
    meta.ditaVersion === '1.3'
  );
}

export function isValidMap(value: unknown): value is DitaMap {
  if (typeof value !== 'object' || value === null) return false;
  const map = value as DitaMap;

  return (
    typeof map.id === 'string' &&
    isValidMapNode(map.root) &&
    isValidMapMetadata(map.metadata)
  );
}

function isValidMapNode(node: unknown): node is MapNode {
  if (typeof node !== 'object' || node === null) return false;
  const mapNode = node as MapNode;

  return (
    typeof mapNode.id === 'string' &&
    mapNode.type === 'topicref' &&
    Array.isArray(mapNode.children) &&
    mapNode.children.every(isValidMapNode)
  );
}

function isValidMapMetadata(metadata: unknown): boolean {
  if (typeof metadata !== 'object' || metadata === null) return false;
  const meta = metadata as any;

  return (
    typeof meta.createdAt === 'string' &&
    typeof meta.modifiedAt === 'string' &&
    meta.ditaVersion === '1.3'
  );
}
