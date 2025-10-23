import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Topic, createEmptyTopic } from '../models/Topic';
import { generateId, Paragraph, UnorderedList } from '../models/DitaElements';

interface TopicStore {
  currentTopic: Topic | null;
  isDirty: boolean;
  lastSaved: string | null;

  // Actions
  createNewTopic: () => void;
  updateTitle: (title: string) => void;
  addParagraph: (afterId?: string) => void;
  convertToList: (paragraphId: string) => void;
  convertToParagraph: (listItemId: string) => void;
  updateText: (elementId: string, content: string) => void;
  deleteElement: (elementId: string) => void;
  saveTopic: () => Promise<void>;
  loadTopic: (topic: Topic) => void;
}

export const useTopicStore = create<TopicStore>()(
  immer((set) => ({
    currentTopic: null,
    isDirty: false,
    lastSaved: null,

    createNewTopic: () => set((state) => {
      state.currentTopic = createEmptyTopic();
      state.isDirty = false;
    }),

    updateTitle: (title: string) => set((state) => {
      if (state.currentTopic) {
        state.currentTopic.title = title;
        state.currentTopic.metadata.modifiedAt = new Date().toISOString();
        state.isDirty = true;
      }
    }),

    addParagraph: (afterId?: string) => set((state) => {
      if (!state.currentTopic) return;

      const newParagraph: Paragraph = {
        type: 'paragraph',
        id: generateId(),
        content: '',
      };

      if (afterId) {
        const index = state.currentTopic.body.content.findIndex((el) => {
          if (el.type === 'paragraph' && el.id === afterId) return true;
          if (el.type === 'unorderedList') {
            return el.items.some((item) => item.id === afterId);
          }
          return false;
        });
        state.currentTopic.body.content.splice(index + 1, 0, newParagraph);
      } else {
        state.currentTopic.body.content.push(newParagraph);
      }

      state.currentTopic.metadata.modifiedAt = new Date().toISOString();
      state.isDirty = true;
    }),

    convertToList: (paragraphId: string) => set((state) => {
      if (!state.currentTopic) return;

      const index = state.currentTopic.body.content.findIndex(
        (el) => el.type === 'paragraph' && el.id === paragraphId
      );

      if (index === -1) return;

      const paragraph = state.currentTopic.body.content[index];
      if (paragraph?.type !== 'paragraph') return;

      const newList: UnorderedList = {
        type: 'unorderedList',
        id: generateId(),
        items: [
          {
            type: 'listItem',
            id: generateId(),
            content: paragraph.content,
          },
        ],
      };

      state.currentTopic.body.content[index] = newList;
      state.currentTopic.metadata.modifiedAt = new Date().toISOString();
      state.isDirty = true;
    }),

    convertToParagraph: (listItemId: string) => set((state) => {
      if (!state.currentTopic) return;

      for (let i = 0; i < state.currentTopic.body.content.length; i++) {
        const element = state.currentTopic.body.content[i];
        if (element?.type === 'unorderedList') {
          const itemIndex = element.items.findIndex((item) => item.id === listItemId);
          if (itemIndex !== -1) {
            const item = element.items[itemIndex];
            if (!item) return;

            const newParagraph: Paragraph = {
              type: 'paragraph',
              id: generateId(),
              content: item.content,
            };

            if (element.items.length === 1) {
              // Last item - replace list with paragraph
              state.currentTopic.body.content[i] = newParagraph;
            } else {
              // Remove item from list, add paragraph after list
              element.items.splice(itemIndex, 1);
              state.currentTopic.body.content.splice(i + 1, 0, newParagraph);
            }

            state.currentTopic.metadata.modifiedAt = new Date().toISOString();
            state.isDirty = true;
            break;
          }
        }
      }
    }),

    updateText: (elementId: string, content: string) => set((state) => {
      if (!state.currentTopic) return;

      for (const element of state.currentTopic.body.content) {
        if (element.type === 'paragraph' && element.id === elementId) {
          element.content = content;
          state.currentTopic.metadata.modifiedAt = new Date().toISOString();
          state.isDirty = true;
          return;
        }
        if (element.type === 'unorderedList') {
          const item = element.items.find((item) => item.id === elementId);
          if (item) {
            item.content = content;
            state.currentTopic.metadata.modifiedAt = new Date().toISOString();
            state.isDirty = true;
            return;
          }
        }
      }
    }),

    deleteElement: (elementId: string) => set((state) => {
      if (!state.currentTopic) return;

      state.currentTopic.body.content = state.currentTopic.body.content.filter(
        (el) => {
          if (el.type === 'paragraph' && el.id === elementId) return false;
          if (el.type === 'unorderedList' && el.id === elementId) return false;
          return true;
        }
      );

      state.currentTopic.metadata.modifiedAt = new Date().toISOString();
      state.isDirty = true;
    }),

    saveTopic: async () => set((state) => {
      state.lastSaved = new Date().toISOString();
      state.isDirty = false;
    }),

    loadTopic: (topic: Topic) => set((state) => {
      state.currentTopic = topic;
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
    }),
  }))
);
