"use client";

import {Dispatch, SetStateAction, useCallback} from "react";
import {DownloadIcon, Redo2Icon, Undo2Icon, UploadIcon} from "lucide-react";
import {useAppStore} from "@/store/puck-editor-store";
import {Button, IconButton} from "@/components/ui/button";
import getClassNameFactory from "@/lib/get-class-name-factory";
import styles from "./styles.module.css";

const getClassName = getClassNameFactory("MenuBar", styles);

export type MenuBarProps = {
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  onPublish?: () => void;
  onExport?: () => void;
  onImport?: () => void;
};

export const MenuBar = ({
  menuOpen = false,
  setMenuOpen,
  onPublish,
  onExport,
  onImport,
}: MenuBarProps) => {
  const back = useAppStore((s) => s.history.back);
  const forward = useAppStore((s) => s.history.forward);
  const hasFuture = useAppStore((s) => s.history.hasFuture());
  const hasPast = useAppStore((s) => s.history.hasPast());

  const handleUndo = useCallback(() => {
    if (hasPast) {
      back();
    }
  }, [back, hasPast]);

  const handleRedo = useCallback(() => {
    if (hasFuture) {
      forward();
    }
  }, [forward, hasFuture]);

  return (
    <div className={getClassName({ menuOpen })}>
      <div className={getClassName("inner")}>
        <div className={getClassName("history")}>
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            title="Undo"
            disabled={!hasPast}
            onClick={handleUndo}
          >
            <Undo2Icon size={18} />
          </IconButton>
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            title="Redo"
            disabled={!hasFuture}
            onClick={handleRedo}
          >
            <Redo2Icon size={18} />
          </IconButton>
        </div>

        <div className={getClassName("actions")}>
          {onImport && (
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              title="Import"
              onClick={onImport}
            >
              <UploadIcon size={18} />
            </IconButton>
          )}
          {onExport && (
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              title="Export"
              onClick={onExport}
            >
              <DownloadIcon size={18} />
            </IconButton>
          )}
          {onPublish && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onPublish}
            >
              Publish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
