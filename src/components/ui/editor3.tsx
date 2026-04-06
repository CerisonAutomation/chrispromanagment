"use client";

import * as React from "react";
import {EditorContent, useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {cn} from "@/lib/utils";

interface Editor3Props {
  content?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
}

export const Editor3: React.FC<Editor3Props> = ({
  content = "",
  onChange,
  editable = true,
  placeholder = "Start typing...",
  className,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  React.useEffect(() => {
    if (editor && !editable) {
      editor.setEditable(false);
    }
  }, [editor, editable]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border border-gray-300 rounded-md overflow-hidden", className)}>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-3 min-h-[120px]"
      />
    </div>
  );
};
