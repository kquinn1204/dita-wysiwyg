// DITA Element Type Definitions per DITA 1.3 spec

export type BodyElement = Paragraph | UnorderedList | CodeBlock | Context | Steps;

export interface Paragraph {
  readonly type: 'paragraph';
  readonly id: string;
  readonly content: string;
}

export interface CodeBlock {
  readonly type: 'codeBlock';
  readonly id: string;
  readonly content: string;
  readonly outputclass?: string; // e.g., "yaml", "terminal"
}

export interface UnorderedList {
  readonly type: 'unorderedList';
  readonly id: string;
  readonly items: ListItem[];
}

export interface ListItem {
  readonly type: 'listItem';
  readonly id: string;
  readonly content: string;
}

// Task-specific elements
export interface Context {
  readonly type: 'context';
  readonly id: string;
  readonly content: Paragraph[];
}

export interface Steps {
  readonly type: 'steps';
  readonly id: string;
  readonly items: Step[];
}

export interface Step {
  readonly type: 'step';
  readonly id: string;
  readonly cmd: string;
  readonly info?: StepInfo[];
  readonly stepxmp?: StepExample[];
  readonly substeps?: SubSteps;
  readonly stepresult?: string;
}

export interface StepInfo {
  readonly type: 'info';
  readonly id: string;
  readonly content: string;
}

export interface StepExample {
  readonly type: 'stepxmp';
  readonly id: string;
  readonly codeblock?: CodeBlock;
}

export interface SubSteps {
  readonly type: 'substeps';
  readonly id: string;
  readonly items: SubStep[];
}

export interface SubStep {
  readonly type: 'substep';
  readonly id: string;
  readonly cmd: string;
  readonly info?: StepInfo[];
  readonly stepxmp?: StepExample[];
}

// Helper function to generate unique IDs
export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
