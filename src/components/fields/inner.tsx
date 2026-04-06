"use client";

import {useMemo} from "react";
import {EditorState, RichTextEditor} from "@/lib/rich-text-types";
import {RichtextField} from "@/lib/canonical-puck-types";
import {ControlContext, useControlContext} from "./lib/use-control-context";
import {Control} from "./components/control";
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Italic,
    List,
    ListOrdered,
    Underline
} from "lucide-react";
import styles from "./styles.module.css";
import getClassNameFactory from "@/lib/get-class-name-factory";

const getClassName = getClassNameFactory("RichTextMenu", styles);

const Group = ({ children }: { children: React.ReactNode }) => (
  <div className={getClassName("group")}>{children}</div>
);

const DefaultMenu = ({ children }: { children: React.ReactNode }) => (
  <div className={getClassName()}>{children}</div>
);

export const LoadedRichTextMenuInner = ({
  editor = null,
  editorState = null,
  field,
  readOnly,
  inline,
}: {
  field: RichtextField;
  editor: RichTextEditor | null;
  editorState?: EditorState | null;
  readOnly: boolean;
  inline?: boolean;
}) => {
  const { renderMenu, renderInlineMenu } = field;

  const InlineMenu = useMemo(
    () => renderInlineMenu || DefaultMenu,
    [renderInlineMenu]
  );

  const Menu = useMemo(() => renderMenu || DefaultMenu, [renderMenu]);

  return (
    <ControlContext.Provider
      value={{ editor, editorState, inline, options: field.options, readOnly }}
    >
      {inline ? (
        <InlineMenu editor={editor} editorState={editorState} readOnly={readOnly}>
          <Group>
            <BoldControl />
            <ItalicControl />
            <UnderlineControl />
          </Group>
        </InlineMenu>
      ) : (
        <Menu editor={editor} editorState={editorState} readOnly={readOnly}>
          <Group>
            <HeadingSelect />
            <ListSelect />
          </Group>
          <Group>
            <BoldControl />
            <ItalicControl />
            <UnderlineControl />
          </Group>
          <Group>
            <AlignSelect />
          </Group>
        </Menu>
      )}
    </ControlContext.Provider>
  );
};

// Control components
const BoldControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive("bold") || false;
  return (
    <Control isActive={isActive} isDisabled={editor?.isEditable === false}>
      <Bold size={16} />
    </Control>
  );
};

const ItalicControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive("italic") || false;
  return (
    <Control isActive={isActive} isDisabled={editor?.isEditable === false}>
      <Italic size={16} />
    </Control>
  );
};

const UnderlineControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive("underline") || false;
  return (
    <Control isActive={isActive} isDisabled={editor?.isEditable === false}>
      <Underline size={16} />
    </Control>
  );
};

const HeadingSelect = () => {
  const { editor } = useControlContext();
  const getHeadingLevel = () => {
    if (editor?.isActive("heading", { level: 1 })) return 1;
    if (editor?.isActive("heading", { level: 2 })) return 2;
    if (editor?.isActive("heading", { level: 3 })) return 3;
    return "P";
  };

  return <Control>{getHeadingLevel()}</Control>;
};

const ListSelect = () => {
  const { editor } = useControlContext();
  const isBullet = editor?.isActive("bulletList") || false;
  const isOrdered = editor?.isActive("orderedList") || false;

  return (
    <Control isActive={isBullet || isOrdered}>
      {isBullet ? <List size={16} /> : isOrdered ? <ListOrdered size={16} /> : <List size={16} />}
    </Control>
  );
};

const AlignSelect = () => {
  const { editor } = useControlContext();
  const getActiveAlign = () => {
    if (editor?.isActive({ textAlign: "left" })) return "left";
    if (editor?.isActive({ textAlign: "center" })) return "center";
    if (editor?.isActive({ textAlign: "right" })) return "right";
    return "left";
  };

  const align = getActiveAlign();
  const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : align === "right" ? AlignRight : AlignJustify;

  return (
    <Control isActive>
      <Icon size={16} />
    </Control>
  );
};
