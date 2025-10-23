import React, { useEffect, useState, useCallback } from 'react';
import { EditorState } from 'prosemirror-state';
import { history } from 'prosemirror-history';
import { DOMParser as PMDOMParser } from 'prosemirror-model';
import { useTopicStore } from '../../stores/topicStore';
import { topicSchema } from '../../editor/schemas/topicSchema';
import { ditaKeymap } from '../../editor/plugins/keymap';
import { Toolbar } from './Toolbar';
import { EditorView } from './EditorView';
import { XmlEditor } from './XmlEditor';
import { BodyElement } from '../../models/DitaElements';
import { TopicSerializer } from '../../editor/serializers/topicSerializer';

// Convert our data model to HTML for ProseMirror parsing
const contentToHtml = (content: BodyElement[]): string => {
  const elements = content.map((element) => {
    if (element.type === 'paragraph') {
      return `<p>${escapeHtml(element.content)}</p>`;
    } else if (element.type === 'codeBlock') {
      return `<pre>${escapeHtml(element.content)}</pre>`;
    } else if (element.type === 'unorderedList') {
      const items = element.items
        .map((item) => `<li>${escapeHtml(item.content)}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    } else if (element.type === 'context') {
      const paras = element.content
        .map((p) => `<p><strong>Context:</strong> ${escapeHtml(p.content)}</p>`)
        .join('');
      return paras;
    } else if (element.type === 'steps') {
      const steps = element.items.map((step, index) => {
        let html = `<p><strong>Step ${index + 1}:</strong> ${escapeHtml(step.cmd)}</p>`;

        if (step.info) {
          step.info.forEach((info) => {
            html += `<p style="margin-left: 2rem;">${escapeHtml(info.content)}</p>`;
          });
        }

        if (step.stepxmp) {
          step.stepxmp.forEach((example) => {
            if (example.codeblock) {
              html += `<pre>${escapeHtml(example.codeblock.content)}</pre>`;
            }
          });
        }

        if (step.substeps) {
          step.substeps.items.forEach((substep, subIndex) => {
            html += `<p style="margin-left: 3rem;"><strong>Step ${index + 1}.${subIndex + 1}:</strong> ${escapeHtml(substep.cmd)}</p>`;
            if (substep.info) {
              substep.info.forEach((info) => {
                html += `<p style="margin-left: 4rem;">${escapeHtml(info.content)}</p>`;
              });
            }
            if (substep.stepxmp) {
              substep.stepxmp.forEach((example) => {
                if (example.codeblock) {
                  html += `<pre style="margin-left: 3rem;">${escapeHtml(example.codeblock.content)}</pre>`;
                }
              });
            }
          });
        }

        if (step.stepresult) {
          html += `<p style="margin-left: 2rem;"><em>Result:</em> ${escapeHtml(step.stepresult)}</p>`;
        }

        return html;
      }).join('');
      return steps;
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

export const TopicEditor: React.FC = () => {
  const { currentTopic, updateTitle, loadTopic } = useTopicStore();
  const [xmlContent, setXmlContent] = useState<string>('');
  const [serializer] = useState(() => new TopicSerializer());
  const [isXmlDirty, setIsXmlDirty] = useState(false);
  const [sourceXml, setSourceXml] = useState<string>(''); // Store original pasted XML

  const [editorState, setEditorState] = useState<EditorState>(() =>
    EditorState.create({
      schema: topicSchema,
      plugins: [history(), ditaKeymap],
    })
  );

  // Sync editor state and XML when topic changes
  useEffect(() => {
    if (currentTopic && !isXmlDirty) {
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
  }, [currentTopic?.id, currentTopic, serializer, isXmlDirty, sourceXml]);

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
            onStateChange={setEditorState}
            className="topic-content"
          />
        </div>
      </div>
    </div>
  );
};
