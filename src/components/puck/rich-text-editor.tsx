// =============================================================================
// CANONICAL PUCK RICH TEXT EDITOR
// TipTap integration with link/text formatting
// Mirror of puck-main/packages/core/components/RichTextEditor/
// =============================================================================

import React, {useMemo} from "react";
import {EditorContent, useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import styles from "./styles.module.css";

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const MenuBar = ({ editor }: { editor: ReturnType<typeof useEditor> }) => {
  if (!editor) return null;

  return (
    <div className={styles.menuBar}>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? styles.active : ""}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? styles.active : ""}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? styles.active : ""}
      >
        S
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleLink({ href: "" }).run()}
        className={editor.isActive("link") ? styles.active : ""}
      >
        Link
      </button>
    </div>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start typing...",
  readOnly = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: styles.link,
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update content when value prop changes
  useMemo(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  return (
    <div className={styles.editor}>
      {!readOnly && <MenuBar editor={editor} />}
      <EditorContent editor={editor} className={styles.content} />
    </div>
  );
};

export default RichTextEditor;
