"use client";

import type {Editor} from "@tiptap/core";

export interface RichTextEditor extends Editor {
  isEditable: boolean;
  isActive: (name: string, attrs?: Record<string, any>) => boolean;
  chain: () => {
    focus: () => {
      setParagraph: () => { run: () => void };
      setHeading: (attrs: { level: 1 | 2 | 3 | 4 | 5 | 6 }) => { run: () => void };
      toggleHeading: (attrs: { level: 1 | 2 | 3 | 4 | 5 | 6 }) => { run: () => void };
      toggleBold: () => { run: () => void };
      toggleItalic: () => { run: () => void };
      toggleUnderline: () => { run: () => void };
      toggleStrike: () => { run: () => void };
      toggleCode: () => { run: () => void };
      toggleBulletList: () => { run: () => void };
      toggleOrderedList: () => { run: () => void };
      toggleBlockquote: () => { run: () => void };
      toggleCodeBlock: () => { run: () => void };
      setTextAlign: (align: string) => { run: () => void };
      run: () => void;
    };
    run: () => void;
  };
}

export interface EditorState {
  doc: any;
  selection: any;
}

export interface RichtextField {
  type: "richtext";
  label?: string;
  description?: string;
  placeholder?: string;
  options?: Record<string, any>;
  renderMenu?: React.ComponentType<any>;
  renderInlineMenu?: React.ComponentType<any>;
}
