"use client";

import {lazy, Suspense, useMemo, useState} from "react";
import {EditorState, RichTextEditor} from "@/lib/rich-text-types";
import {RichtextField} from "@/lib/canonical-puck-types";
import styles from "./styles.module.css";
import getClassNameFactory from "@/lib/get-class-name-factory";
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Blockquote,
    Bold,
    BulletList,
    ChevronDown,
    CodeBlock,
    HorizontalRule,
    InlineCode,
    Italic,
    List,
    ListOrdered,
    Strikethrough,
    Underline,
} from "lucide-react";
import {ControlContext, useControlContext} from "./lib/use-control-context";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

const getClassName = getClassNameFactory("RichTextMenu", styles);

export type LoadedRichTextMenuProps = {
  field: RichtextField;
  editor: RichTextEditor | null;
  editorState?: EditorState | null;
  readOnly: boolean;
  inline?: boolean;
};

const LoadedRichTextMenuInner = lazy(() =>
  import("./inner").then((m) => ({
    default: m.LoadedRichTextMenuInner,
  }))
);

export const LoadedRichTextMenu = (props: LoadedRichTextMenuProps) => {
  return (
    <Suspense fallback={<LoadedRichTextMenuInnerFallback {...props} />}>
      <LoadedRichTextMenuInner {...props} />
    </Suspense>
  );
};

const RichTextMenu = ({
  children,
  inline = false,
}: {
  children: React.ReactNode;
  inline?: boolean;
}) => {
  const { inline: isInline } = useControlContext();
  return (
    <div
      className={getClassName({ inline: isInline || inline, form: !isInline && !inline })}
      data-puck-rte-menu
    >
      {children}
    </div>
  );
};

const Group = ({ children }: { children: React.ReactNode }) => {
  return <div className={getClassName("group")}>{children}</div>;
};

const ControlWrapper = ({
  children,
  isActive,
  isDisabled,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  isDisabled?: boolean;
}) => {
  return (
    <button
      type="button"
      className={cn(
        getClassName("control"),
        isActive && getClassName("control", { active: true }),
        isDisabled && getClassName("control", { disabled: true })
      )}
      disabled={isDisabled}
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
};

const BoldControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive("bold") || false;

  return (
    <ControlWrapper isActive={isActive} isDisabled={editor?.isEditable === false}>
      <Bold size={16} />
    </ControlWrapper>
  );
};

const ItalicControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive("italic") || false;

  return (
    <ControlWrapper isActive={isActive} isDisabled={editor?.isEditable === false}>
      <Italic size={16} />
    </ControlWrapper>
  );
};

const UnderlineControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive("underline") || false;

  return (
    <ControlWrapper isActive={isActive} isDisabled={editor?.isEditable === false}>
      <Underline size={16} />
    </ControlWrapper>
  );
};

const StrikeControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive("strike") || false;

  return (
    <ControlWrapper isActive={isActive} isDisabled={editor?.isEditable === false}>
      <Strikethrough size={16} />
    </ControlWrapper>
  );
};

const CodeControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive("code") || false;

  return (
    <ControlWrapper isActive={isActive} isDisabled={editor?.isEditable === false}>
      <InlineCode size={16} />
    </ControlWrapper>
  );
};

const HeadingSelect = () => {
  const { editor } = useControlContext();
  const [open, setOpen] = useState(false);

  const getHeadingLevel = () => {
    if (editor?.isActive("heading", { level: 1 })) return 1;
    if (editor?.isActive("heading", { level: 2 })) return 2;
    if (editor?.isActive("heading", { level: 3 })) return 3;
    if (editor?.isActive("heading", { level: 4 })) return 4;
    if (editor?.isActive("heading", { level: 5 })) return 5;
    if (editor?.isActive("heading", { level: 6 })) return 6;
    return "Paragraph";
  };

  const handleSelect = (level: number | "Paragraph") => {
    if (level === "Paragraph") {
      editor?.chain().focus().setParagraph().run();
    } else {
      editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    }
    setOpen(false);
  };

  const level = getHeadingLevel();

  return (
    <div className={getClassName("selectWrapper")}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={getClassName("selectButton")}
        onClick={() => setOpen(!open)}
        onMouseDown={(e) => e.preventDefault()}
      >
        {typeof level === "number" ? `H${level}` : level}
        <ChevronDown size={14} />
      </Button>
      {open && (
        <div className={getClassName("selectDropdown")}>
          {["Paragraph", 1, 2, 3, 4, 5, 6].map((item) => (
            <button
              key={item}
              type="button"
              className={cn(
                getClassName("selectOption"),
                (typeof level === "number" ? level : "Paragraph") === item &&
                  getClassName("selectOption", { active: true })
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item as number | "Paragraph");
              }}
            >
              {item === "Paragraph" ? item : `Heading ${item}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const BulletListControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive("bulletList") || false;

  return (
    <ControlWrapper isActive={isActive} isDisabled={editor?.isEditable === false}>
      <BulletList size={16} />
    </ControlWrapper>
  );
};

const OrderedListControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive("orderedList") || false;

  return (
    <ControlWrapper isActive={isActive} isDisabled={editor?.isEditable === false}>
      <ListOrdered size={16} />
    </ControlWrapper>
  );
};

const AlignLeftControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive({ textAlign: "left" }) || false;

  return (
    <ControlWrapper isActive={isActive} isDisabled={editor?.isEditable === false}>
      <AlignLeft size={16} />
    </ControlWrapper>
  );
};

const AlignCenterControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive({ textAlign: "center" }) || false;

  return (
    <ControlWrapper isActive={isActive} isDisabled={editor?.isEditable === false}>
      <AlignCenter size={16} />
    </ControlWrapper>
  );
};

const AlignRightControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive({ textAlign: "right" }) || false;

  return (
    <ControlWrapper isActive={isActive} isDisabled={editor?.isEditable === false}>
      <AlignRight size={16} />
    </ControlWrapper>
  );
};

const AlignJustifyControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive({ textAlign: "justify" }) || false;

  return (
    <ControlWrapper isActive={isActive} isDisabled={editor?.isEditable === false}>
      <AlignJustify size={16} />
    </ControlWrapper>
  );
};

const BlockquoteControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive("blockquote") || false;

  return (
    <ControlWrapper isActive={isActive} isDisabled={editor?.isEditable === false}>
      <Blockquote size={16} />
    </ControlWrapper>
  );
};

const CodeBlockControl = () => {
  const { editor } = useControlContext();
  const isActive = editor?.isActive("codeBlock") || false;

  return (
    <ControlWrapper isActive={isActive} isDisabled={editor?.isEditable === false}>
      <CodeBlock size={16} />
    </ControlWrapper>
  );
};

const HorizontalRuleControl = () => {
  const { editor } = useControlContext();

  return (
    <ControlWrapper isDisabled={editor?.isEditable === false}>
      <HorizontalRule size={16} />
    </ControlWrapper>
  );
};

const AlignSelect = () => {
  const { editor } = useControlContext();
  const [open, setOpen] = useState(false);

  const getActiveAlign = () => {
    if (editor?.isActive({ textAlign: "left" })) return "left";
    if (editor?.isActive({ textAlign: "center" })) return "center";
    if (editor?.isActive({ textAlign: "right" })) return "right";
    if (editor?.isActive({ textAlign: "justify" })) return "justify";
    return "left";
  };

  const align = getActiveAlign();

  const controls = {
    left: AlignLeftControl,
    center: AlignCenterControl,
    right: AlignRightControl,
    justify: AlignJustifyControl,
  };

  const ActiveControl = controls[align as keyof typeof controls];

  return (
    <div className={getClassName("selectWrapper")}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={getClassName("selectButton")}
        onClick={() => setOpen(!open)}
        onMouseDown={(e) => e.preventDefault()}
      >
        <ActiveControl />
        <ChevronDown size={14} />
      </Button>
      {open && (
        <div className={getClassName("selectDropdown")}>
          <ControlWrapper isActive={align === "left"} onClick={() => editor?.chain().focus().setTextAlign("left").run()}>
            <AlignLeft size={16} />
          </ControlWrapper>
          <ControlWrapper isActive={align === "center"} onClick={() => editor?.chain().focus().setTextAlign("center").run()}>
            <AlignCenter size={16} />
          </ControlWrapper>
          <ControlWrapper isActive={align === "right"} onClick={() => editor?.chain().focus().setTextAlign("right").run()}>
            <AlignRight size={16} />
          </ControlWrapper>
          <ControlWrapper isActive={align === "justify"} onClick={() => editor?.chain().focus().setTextAlign("justify").run()}>
            <AlignJustify size={16} />
          </ControlWrapper>
        </div>
      )}
    </div>
  );
};

const ListSelect = () => {
  const { editor } = useControlContext();
  const [open, setOpen] = useState(false);

  const isBullet = editor?.isActive("bulletList") || false;
  const isOrdered = editor?.isActive("orderedList") || false;

  return (
    <div className={getClassName("selectWrapper")}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={getClassName("selectButton")}
        onClick={() => setOpen(!open)}
        onMouseDown={(e) => e.preventDefault()}
      >
        {isBullet ? <BulletList size={16} /> : isOrdered ? <ListOrdered size={16} /> : <List size={16} />}
        <ChevronDown size={14} />
      </Button>
      {open && (
        <div className={getClassName("selectDropdown")}>
          <ControlWrapper isActive={isBullet} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            <BulletList size={16} />
          </ControlWrapper>
          <ControlWrapper isActive={isOrdered} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={16} />
          </ControlWrapper>
        </div>
      )}
    </div>
  );
};

const DefaultMenu = ({ children }: { children: React.ReactNode }) => {
  return <RichTextMenu>{children}</RichTextMenu>;
};

const LoadedRichTextMenuInnerFallback = ({
  editor = null,
  editorState = null,
  field,
  readOnly,
  inline,
}: LoadedRichTextMenuProps) => {
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

