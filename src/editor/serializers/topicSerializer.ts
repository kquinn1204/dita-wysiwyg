import { Topic } from '../../models/Topic';
import { BodyElement, Paragraph, UnorderedList, ListItem, CodeBlock, Context, Steps, Step, StepInfo, StepExample, SubSteps, SubStep, generateId } from '../../models/DitaElements';

export class TopicSerializer {
  toXml(topic: Topic): string {
    const topicType = topic.topicType || 'topic';
    const bodyType = topicType === 'task' ? 'taskbody' : topicType === 'concept' ? 'conbody' : topicType === 'reference' ? 'refbody' : 'body';
    const dtdType = topicType === 'topic' ? 'Topic' : topicType === 'task' ? 'Task' : topicType === 'concept' ? 'Concept' : 'Reference';
    const dtdFile = `${topicType}.dtd`;

    const bodyContent = topic.body.content.map((el) => this.elementToXml(el, '    ')).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ${topicType} PUBLIC "-//OASIS//DTD DITA ${dtdType}//EN" "${dtdFile}">
<${topicType} id="${topic.id}">
  <title>${this.escapeXml(topic.title)}</title>
  <${bodyType}>
${bodyContent}
  </${bodyType}>
</${topicType}>`;
  }

  private elementToXml(element: BodyElement, indent: string): string {
    switch (element.type) {
      case 'paragraph':
        return `${indent}<p>${this.escapeXml(element.content)}</p>`;

      case 'codeBlock': {
        const outputclass = element.outputclass ? ` outputclass="${element.outputclass}"` : '';
        return `${indent}<codeblock${outputclass}>${this.escapeXml(element.content)}</codeblock>`;
      }

      case 'unorderedList': {
        const items = element.items
          .map((item) => `${indent}  <li>${this.escapeXml(item.content)}</li>`)
          .join('\n');
        return `${indent}<ul>\n${items}\n${indent}</ul>`;
      }

      case 'context': {
        const paras = element.content
          .map((p) => `${indent}  <p>${this.escapeXml(p.content)}</p>`)
          .join('\n');
        return `${indent}<context>\n${paras}\n${indent}</context>`;
      }

      case 'steps': {
        const steps = element.items
          .map((step) => this.stepToXml(step, indent + '  '))
          .join('\n');
        return `${indent}<steps>\n${steps}\n${indent}</steps>`;
      }

      default:
        return '';
    }
  }

  private stepToXml(step: Step, indent: string): string {
    let xml = `${indent}<step>\n`;
    xml += `${indent}  <cmd>${this.escapeXml(step.cmd)}</cmd>\n`;

    if (step.info) {
      step.info.forEach((info) => {
        xml += `${indent}  <info>${this.escapeXml(info.content)}</info>\n`;
      });
    }

    if (step.stepxmp) {
      step.stepxmp.forEach((example) => {
        xml += `${indent}  <stepxmp>\n`;
        if (example.codeblock) {
          xml += this.elementToXml(example.codeblock, indent + '    ') + '\n';
        }
        xml += `${indent}  </stepxmp>\n`;
      });
    }

    if (step.substeps) {
      xml += `${indent}  <substeps>\n`;
      step.substeps.items.forEach((substep) => {
        xml += this.substepToXml(substep, indent + '    ');
      });
      xml += `${indent}  </substeps>\n`;
    }

    if (step.stepresult) {
      xml += `${indent}  <stepresult>${this.escapeXml(step.stepresult)}</stepresult>\n`;
    }

    xml += `${indent}</step>`;
    return xml;
  }

  private substepToXml(substep: SubStep, indent: string): string {
    let xml = `${indent}<substep>\n`;
    xml += `${indent}  <cmd>${this.escapeXml(substep.cmd)}</cmd>\n`;

    if (substep.info) {
      substep.info.forEach((info) => {
        xml += `${indent}  <info>${this.escapeXml(info.content)}</info>\n`;
      });
    }

    if (substep.stepxmp) {
      substep.stepxmp.forEach((example) => {
        xml += `${indent}  <stepxmp>\n`;
        if (example.codeblock) {
          xml += this.elementToXml(example.codeblock, indent + '    ') + '\n';
        }
        xml += `${indent}  </stepxmp>\n`;
      });
    }

    xml += `${indent}</substep>\n`;
    return xml;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  fromXml(xml: string): Topic {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML: ' + parserError.textContent);
    }

    // Support both <topic> and specialized topic types (task, concept, reference)
    const topicElement = doc.querySelector('topic, task, concept, reference');
    if (!topicElement) {
      throw new Error('No DITA topic element found in XML (expected <topic>, <task>, <concept>, or <reference>)');
    }

    const topicId = topicElement.getAttribute('id') || `topic-${Date.now()}`;
    const titleElement = topicElement.querySelector('title');
    const title = titleElement?.textContent || 'Untitled Topic';

    // Support both <body> and specialized body types (taskbody, conbody, refbody)
    const bodyElement = topicElement.querySelector('body, taskbody, conbody, refbody');
    const content: BodyElement[] = [];

    if (bodyElement) {
      // Parse body content recursively
      this.parseBodyContent(bodyElement, content);
    }

    const now = new Date().toISOString();
    const topicType = topicElement.tagName.toLowerCase() as 'topic' | 'task' | 'concept' | 'reference';

    return {
      id: topicId,
      title,
      body: {
        content,
      },
      metadata: {
        createdAt: now,
        modifiedAt: now,
        ditaVersion: '1.3',
      },
      topicType,
    };
  }

  private parseBodyContent(container: Element, content: BodyElement[]): void {
    const children = Array.from(container.children);
    for (const child of children) {
      const element = this.parseElement(child);
      if (element) {
        content.push(element);
      }
    }
  }

  private parseElement(element: Element): BodyElement | null {
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
      case 'p': {
        const text = this.unescapeXml(element.textContent || '');
        if (!text.trim()) return null; // Skip empty paragraphs
        const paragraph: Paragraph = {
          type: 'paragraph',
          id: generateId(),
          content: text,
        };
        return paragraph;
      }

      case 'ul': {
        const listItems: ListItem[] = [];
        const liElements = element.querySelectorAll(':scope > li');
        for (const li of Array.from(liElements)) {
          listItems.push({
            type: 'listItem',
            id: generateId(),
            content: this.unescapeXml(li.textContent || ''),
          });
        }
        if (listItems.length === 0) return null;
        const list: UnorderedList = {
          type: 'unorderedList',
          id: generateId(),
          items: listItems,
        };
        return list;
      }

      case 'codeblock': {
        const codeContent = element.textContent || '';
        const outputclass = element.getAttribute('outputclass') || undefined;
        const codeBlock: CodeBlock = {
          type: 'codeBlock',
          id: generateId(),
          content: codeContent,
          outputclass,
        };
        return codeBlock;
      }

      case 'context': {
        const paragraphs: Paragraph[] = [];
        const pElements = element.querySelectorAll(':scope > p');
        for (const p of Array.from(pElements)) {
          const text = this.unescapeXml(p.textContent || '');
          if (text.trim()) {
            paragraphs.push({
              type: 'paragraph',
              id: generateId(),
              content: text,
            });
          }
        }
        if (paragraphs.length === 0) return null;
        const context: Context = {
          type: 'context',
          id: generateId(),
          content: paragraphs,
        };
        return context;
      }

      case 'steps': {
        const steps: Step[] = [];
        const stepElements = element.querySelectorAll(':scope > step');
        for (const stepEl of Array.from(stepElements)) {
          const step = this.parseStep(stepEl);
          if (step) {
            steps.push(step);
          }
        }
        if (steps.length === 0) return null;
        const stepsElement: Steps = {
          type: 'steps',
          id: generateId(),
          items: steps,
        };
        return stepsElement;
      }

      default:
        return null;
    }
  }

  private parseStep(stepElement: Element): Step | null {
    const cmdElement = stepElement.querySelector(':scope > cmd');
    if (!cmdElement) return null;

    const cmd = this.unescapeXml(cmdElement.textContent || '');

    const info: StepInfo[] = [];
    const infoElements = stepElement.querySelectorAll(':scope > info');
    for (const infoEl of Array.from(infoElements)) {
      const content = this.unescapeXml(infoEl.textContent || '');
      if (content.trim()) {
        info.push({
          type: 'info',
          id: generateId(),
          content,
        });
      }
    }

    const stepxmp: StepExample[] = [];
    const stepxmpElements = stepElement.querySelectorAll(':scope > stepxmp');
    for (const exampleEl of Array.from(stepxmpElements)) {
      const codeblockEl = exampleEl.querySelector(':scope > codeblock');
      if (codeblockEl) {
        const codeContent = codeblockEl.textContent || '';
        const outputclass = codeblockEl.getAttribute('outputclass') || undefined;
        stepxmp.push({
          type: 'stepxmp',
          id: generateId(),
          codeblock: {
            type: 'codeBlock',
            id: generateId(),
            content: codeContent,
            outputclass,
          },
        });
      }
    }

    // Parse substeps
    let substeps: SubSteps | undefined = undefined;
    const substepsElement = stepElement.querySelector(':scope > substeps');
    if (substepsElement) {
      const substepItems: SubStep[] = [];
      const substepElements = substepsElement.querySelectorAll(':scope > substep');
      for (const substepEl of Array.from(substepElements)) {
        const substep = this.parseSubstep(substepEl);
        if (substep) {
          substepItems.push(substep);
        }
      }
      if (substepItems.length > 0) {
        substeps = {
          type: 'substeps',
          id: generateId(),
          items: substepItems,
        };
      }
    }

    // Parse stepresult
    const stepresultElement = stepElement.querySelector(':scope > stepresult');
    const stepresult = stepresultElement ? this.unescapeXml(stepresultElement.textContent || '') : undefined;

    return {
      type: 'step',
      id: generateId(),
      cmd,
      info: info.length > 0 ? info : undefined,
      stepxmp: stepxmp.length > 0 ? stepxmp : undefined,
      substeps,
      stepresult,
    };
  }

  private parseSubstep(substepElement: Element): SubStep | null {
    const cmdElement = substepElement.querySelector(':scope > cmd');
    if (!cmdElement) return null;

    const cmd = this.unescapeXml(cmdElement.textContent || '');

    const info: StepInfo[] = [];
    const infoElements = substepElement.querySelectorAll(':scope > info');
    for (const infoEl of Array.from(infoElements)) {
      const content = this.unescapeXml(infoEl.textContent || '');
      if (content.trim()) {
        info.push({
          type: 'info',
          id: generateId(),
          content,
        });
      }
    }

    const stepxmp: StepExample[] = [];
    const stepxmpElements = substepElement.querySelectorAll(':scope > stepxmp');
    for (const exampleEl of Array.from(stepxmpElements)) {
      const codeblockEl = exampleEl.querySelector(':scope > codeblock');
      if (codeblockEl) {
        const codeContent = codeblockEl.textContent || '';
        const outputclass = codeblockEl.getAttribute('outputclass') || undefined;
        stepxmp.push({
          type: 'stepxmp',
          id: generateId(),
          codeblock: {
            type: 'codeBlock',
            id: generateId(),
            content: codeContent,
            outputclass,
          },
        });
      }
    }

    return {
      type: 'substep',
      id: generateId(),
      cmd,
      info: info.length > 0 ? info : undefined,
      stepxmp: stepxmp.length > 0 ? stepxmp : undefined,
    };
  }

  private unescapeXml(text: string): string {
    return text
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&');
  }
}

export const topicSerializer = new TopicSerializer();
