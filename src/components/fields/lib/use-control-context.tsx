"use client";

import {createContext, useContext} from "react";
import {RichTextEditor} from "@/lib/rich-text-types";

type ControlContextType = {
  editor: RichTextEditor | null;
  editorState?: any;
  inline?: boolean;
  options?: Record<string, any>;
  readOnly?: boolean;
};

export const ControlContext = createContext<ControlContextType>({
  editor: null,
  inline: false,
  readOnly: false,
});

export const useControlContext = () => useContext(ControlContext);
