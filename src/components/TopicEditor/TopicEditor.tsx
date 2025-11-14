import React, { useEffect, useState, useCallback } from 'react';
import { EditorState } from 'prosemirror-state';
import { history } from 'prosemirror-history';
import { DOMParser as PMDOMParser } from 'prosemirror-model';
import { Node as PMNode } from 'prosemirror-model';
import { useTopicStore } from '../../stores/topicStore';
import { topicSchema } from '../../editor/schemas/topicSchema';
import { ditaKeymap } from '../../editor/plugins/keymap';
import { Toolbar } from './Toolbar';
import { EditorView } from './EditorView';
import { XmlEditor } from './XmlEditor';
import { BodyElement, Paragraph, CodeBlock, UnorderedList, ListItem, Context, Steps, Step, StepInfo, StepExample, SubSteps, SubStep, generateId } from '../../models/DitaElements';
import { TopicSerializer } from '../../editor/serializers/topicSerializer';

// Convert our data model to HTML for ProseMirror parsing
const contentToHtml = (content: BodyElement[]): string => {
  const elements = content.map((element) => {
    if (element.type === 'paragraph') {
      return `<p class="dita-p" data-id="${element.id}">${escapeHtml(element.content)}</p>`;
    } else if (element.type === 'codeBlock') {
      return `<pre class="dita-codeblock" data-id="${element.id}">${escapeHtml(element.content)}</pre>`;
    } else if (element.type === 'unorderedList') {
      const items = element.items
        .map((item) => `<li class="dita-li" data-id="${item.id}">${escapeHtml(item.content)}</li>`)
        .join('');
      return `<ul class="dita-ul" data-id="${element.id}">${items}</ul>`;
    } else if (element.type === 'context') {
      const paras = element.content
        .map((p) => `<p class="dita-p" data-id="${p.id}">${escapeHtml(p.content)}</p>`)
        .join('');
      return `<div class="dita-context" data-id="${element.id}">${paras}</div>`;
    } else if (element.type === 'steps') {
      const steps = element.items.map((step) => {
        let stepHtml = `<div class="dita-step" data-id="${step.id}">`;
        stepHtml += `<div class="dita-cmd" data-id="${step.id}-cmd">${escapeHtml(step.cmd)}</div>`;

        if (step.info) {
          step.info.forEach((info) => {
            stepHtml += `<div class="dita-info" data-id="${info.id}">${escapeHtml(info.content)}</div>`;
          });
        }

        if (step.stepxmp) {
          step.stepxmp.forEach((example) => {
            if (example.codeblock) {
              stepHtml += `<div class="dita-stepxmp" data-id="${example.id}">`;
              stepHtml += `<pre class="dita-codeblock" data-id="${example.codeblock.id}">${escapeHtml(example.codeblock.content)}</pre>`;
              stepHtml += `</div>`;
            }
          });
        }

        if (step.substeps) {
          stepHtml += `<div class="dita-substeps" data-id="${step.substeps.id}">`;
          step.substeps.items.forEach((substep) => {
            stepHtml += `<div class="dita-substep" data-id="${substep.id}">`;
            stepHtml += `<div class="dita-substep-cmd" data-id="${substep.id}-cmd">${escapeHtml(substep.cmd)}</div>`;

            if (substep.info) {
              substep.info.forEach((info) => {
                stepHtml += `<div class="dita-substep-info" data-id="${info.id}">${escapeHtml(info.content)}</div>`;
              });
            }

            if (substep.stepxmp) {
              substep.stepxmp.forEach((example) => {
                if (example.codeblock) {
                  stepHtml += `<div class="dita-substep-stepxmp" data-id="${example.id}">`;
                  stepHtml += `<pre class="dita-codeblock" data-id="${example.codeblock.id}">${escapeHtml(example.codeblock.content)}</pre>`;
                  stepHtml += `</div>`;
                }
              });
            }

            stepHtml += `</div>`;
          });
          stepHtml += `</div>`;
        }

        if (step.stepresult) {
          stepHtml += `<div class="dita-stepresult" data-id="${step.id}-result">${escapeHtml(step.stepresult)}</div>`;
        }

        stepHtml += `</div>`;
        return stepHtml;
      }).join('');
      return `<div class="dita-steps" data-id="${element.id}">${steps}</div>`;
    }
    return '';
  });
  return elements.join('');
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Convert ProseMirror document back to DITA data model
const prosemirrorToBodyElements = (doc: PMNode): BodyElement[] => {
  const elements: BodyElement[] = [];

  doc.forEach((node) => {
    const element = nodeToBodyElement(node);
    if (element) {
      elements.push(element);
    }
  });

  return elements;
};

const nodeToBodyElement = (node: PMNode): BodyElement | null => {
  switch (node.type.name) {
    case 'paragraph': {
      const paragraph: Paragraph = {
        type: 'paragraph',
        id: node.attrs.id || generateId(),
        content: node.textContent,
      };
      return paragraph;
    }

    case 'code_block': {
      const codeBlock: CodeBlock = {
        type: 'codeBlock',
        id: node.attrs.id || generateId(),
        content: node.textContent,
      };
      return codeBlock;
    }

    case 'bullet_list': {
      const items: ListItem[] = [];
      node.forEach((child) => {
        if (child.type.name === 'list_item') {
          items.push({
            type: 'listItem',
            id: child.attrs.id || generateId(),
            content: child.textContent,
          });
        }
      });
      const list: UnorderedList = {
        type: 'unorderedList',
        id: node.attrs.id || generateId(),
        items,
      };
      return list;
    }

    case 'context': {
      const paragraphs: Paragraph[] = [];
      node.forEach((child) => {
        if (child.type.name === 'paragraph') {
          paragraphs.push({
            type: 'paragraph',
            id: child.attrs.id || generateId(),
            content: child.textContent,
          });
        }
      });
      const context: Context = {
        type: 'context',
        id: node.attrs.id || generateId(),
        content: paragraphs,
      };
      return context;
    }

    case 'steps': {
      const steps: Step[] = [];
      node.forEach((child) => {
        if (child.type.name === 'step') {
          const step = parseStepNode(child);
          if (step) {
            steps.push(step);
          }
        }
      });
      const stepsElement: Steps = {
        type: 'steps',
        id: node.attrs.id || generateId(),
        items: steps,
      };
      return stepsElement;
    }

    default:
      return null;
  }
};

const parseStepNode = (stepNode: PMNode): Step | null => {
  let cmd = '';
  const info: StepInfo[] = [];
  const stepxmp: StepExample[] = [];
  let substeps: SubSteps | undefined = undefined;
  let stepresult: string | undefined = undefined;

  stepNode.forEach((child) => {
    if (child.type.name === 'step_cmd') {
      cmd = child.textContent;
    } else if (child.type.name === 'step_info') {
      info.push({
        type: 'info',
        id: child.attrs.id || generateId(),
        content: child.textContent,
      });
    } else if (child.type.name === 'step_example') {
      child.forEach((exampleChild) => {
        if (exampleChild.type.name === 'code_block') {
          stepxmp.push({
            type: 'stepxmp',
            id: child.attrs.id || generateId(),
            codeblock: {
              type: 'codeBlock',
              id: exampleChild.attrs.id || generateId(),
              content: exampleChild.textContent,
            },
          });
        }
      });
    } else if (child.type.name === 'substeps') {
      const substepItems: SubStep[] = [];
      child.forEach((substepNode) => {
        if (substepNode.type.name === 'substep') {
          const substep = parseSubstepNode(substepNode);
          if (substep) {
            substepItems.push(substep);
          }
        }
      });
      substeps = {
        type: 'substeps',
        id: child.attrs.id || generateId(),
        items: substepItems,
      };
    } else if (child.type.name === 'step_result') {
      stepresult = child.textContent;
    }
  });

  if (!cmd) return null;

  return {
    type: 'step',
    id: stepNode.attrs.id || generateId(),
    cmd,
    info: info.length > 0 ? info : undefined,
    stepxmp: stepxmp.length > 0 ? stepxmp : undefined,
    substeps,
    stepresult,
  };
};

const parseSubstepNode = (substepNode: PMNode): SubStep | null => {
  let cmd = '';
  const info: StepInfo[] = [];
  const stepxmp: StepExample[] = [];

  substepNode.forEach((child) => {
    if (child.type.name === 'substep_cmd') {
      cmd = child.textContent;
    } else if (child.type.name === 'substep_info') {
      info.push({
        type: 'info',
        id: child.attrs.id || generateId(),
        content: child.textContent,
      });
    } else if (child.type.name === 'substep_example') {
      child.forEach((exampleChild) => {
        if (exampleChild.type.name === 'code_block') {
          stepxmp.push({
            type: 'stepxmp',
            id: child.attrs.id || generateId(),
            codeblock: {
              type: 'codeBlock',
              id: exampleChild.attrs.id || generateId(),
              content: exampleChild.textContent,
            },
          });
        }
      });
    }
  });

  if (!cmd) return null;

  return {
    type: 'substep',
    id: substepNode.attrs.id || generateId(),
    cmd,
    info: info.length > 0 ? info : undefined,
    stepxmp: stepxmp.length > 0 ? stepxmp : undefined,
  };
};

export const TopicEditor: React.FC = () => {
  const { currentTopic, updateTitle, loadTopic, updateBody } = useTopicStore();
  const [xmlContent, setXmlContent] = useState<string>('');
  const [serializer] = useState(() => new TopicSerializer());
  const [isXmlDirty, setIsXmlDirty] = useState(false);
  const [isWysiwygDirty, setIsWysiwygDirty] = useState(false);
  const [sourceXml, setSourceXml] = useState<string>(''); // Store original pasted XML

  const [editorState, setEditorState] = useState<EditorState>(() =>
    EditorState.create({
      schema: topicSchema,
      plugins: [history(), ditaKeymap],
    })
  );

  // Sync editor state and XML when topic changes
  useEffect(() => {
    if (currentTopic && !isXmlDirty && !isWysiwygDirty) {
      // If we have source XML and only the title changed, use source XML with updated title
      if (sourceXml && currentTopic.topicType && currentTopic.topicType !== 'topic') {
        // For tasks/concepts/references, preserve the original XML structure
        // Just update the title in the XML
        const titleRegex = /(<title>)[^<]*(<\/title>)/;
        const updatedXml = sourceXml.replace(
          titleRegex,
          `$1${currentTopic.title}$2`
        );
        setXmlContent(updatedXml);
      } else {
        // For regular topics or new topics, generate XML
        const xml = serializer.toXml(currentTopic);
        setXmlContent(xml);
      }

      // Convert topic body to ProseMirror document
      const htmlContent = contentToHtml(currentTopic.body.content);
      const div = document.createElement('div');
      div.innerHTML = htmlContent;

      const doc = PMDOMParser.fromSchema(topicSchema).parse(div);
      const newState = EditorState.create({
        doc,
        schema: topicSchema,
        plugins: [history(), ditaKeymap],
      });
      setEditorState(newState);
    }
  }, [currentTopic?.id, currentTopic, serializer, isXmlDirty, isWysiwygDirty, sourceXml]);

  // Handle XML editor changes
  const handleXmlChange = useCallback((newXml: string) => {
    setXmlContent(newXml);
    setSourceXml(newXml); // Store as source
    setIsXmlDirty(true);

    // Debounce XML parsing to avoid too many updates while typing
    const timeoutId = setTimeout(() => {
      try {
        const topic = serializer.fromXml(newXml);
        loadTopic(topic);
        setIsXmlDirty(false);
      } catch (error) {
        // Invalid XML - don't update the topic
        console.error('Invalid XML:', error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [serializer, loadTopic]);

  // Handle WYSIWYG editor state changes
  const handleEditorStateChange = useCallback((newState: EditorState) => {
    setEditorState(newState);
    setIsWysiwygDirty(true);

    // Debounce conversion to avoid too many updates while typing
    const timeoutId = setTimeout(() => {
      if (currentTopic) {
        // Convert ProseMirror document to DITA data model
        const bodyElements = prosemirrorToBodyElements(newState.doc);

        // Update the topic body
        updateBody(bodyElements);

        // Clear source XML since we're now editing via WYSIWYG
        setSourceXml('');
        setIsWysiwygDirty(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [currentTopic, updateBody]);

  const handleCommand = (command: (state: EditorState, dispatch?: any) => boolean) => {
    const { state, view } = editorState as any;
    if (view) {
      command(state, view.dispatch);
    } else {
      // Execute command and update state
      let newState = editorState;
      command(editorState, (tr: any) => {
        newState = editorState.apply(tr);
      });
      setEditorState(newState);
    }
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (currentTopic) {
      updateTitle(event.target.value);
    }
  };

  if (!currentTopic) {
    return (
      <div className="topic-editor-empty">
        <p>No topic loaded. Create a new topic to get started.</p>
      </div>
    );
  }

  return (
    <div className="topic-editor">
      <div className="topic-header">
        <input
          type="text"
          className="topic-title-input"
          value={currentTopic.title}
          onChange={handleTitleChange}
          placeholder="Enter topic title..."
        />
      </div>
      <div className="editor-split-pane">
        <div className="editor-pane editor-pane-xml">
          <div className="pane-header">DITA XML Source</div>
          <XmlEditor
            value={xmlContent}
            onChange={handleXmlChange}
            className="xml-content"
          />
        </div>
        <div className="editor-pane editor-pane-wysiwyg">
          <div className="pane-header">WYSIWYG Editor</div>
          <Toolbar
            editorState={editorState}
            onCommand={handleCommand}
            className="topic-toolbar"
          />
          <EditorView
            state={editorState}
            onStateChange={handleEditorStateChange}
            className="topic-content"
          />
        </div>
      </div>
    </div>
  );
};
