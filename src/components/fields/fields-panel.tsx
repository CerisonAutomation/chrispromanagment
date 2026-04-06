"use client";

import {memo, ReactNode, useCallback, useEffect, useMemo} from "react";
import {useAppStore, useAppStoreApi} from "@/store/puck-editor-store";
import {useShallow} from "zustand/react/shallow";
import getClassNameFactory from "@/lib/get-class-name-factory";
import styles from "./styles.module.css";
import {AutoFieldPrivate} from "./auto-field";
import {fieldContextStore} from "./store";
import {Loader} from "@/components/ui/loader";
import {rootDroppableId} from "@/lib/root-droppable-id";
import {getSelectorForId} from "@/lib/get-selector-for-id";
import {UiState} from "@/lib/canonical-puck-types";
import {StoreApi} from "zustand";

const getClassName = getClassNameFactory("PuckFields", styles);

type ItemSelector = {
  zone: string;
  index: number;
};

const DefaultFields = ({
  children,
}: {
  children: ReactNode;
  isLoading: boolean;
  itemSelector?: ItemSelector | null;
}) => {
  return <>{children}</>;
};

// Memoized onChange handler factory
const createOnChange = memo(
  (
    fieldName: string, 
    appStore: StoreApi<ReturnType<typeof useAppStore.getState>>
  ) => async (value: any, updatedUi?: Partial<UiState>) => {
    const { dispatch, selectedItem, resolveComponentData } = appStore.getState();
    const { data, ui } = appStore.getState().state;
    const { itemSelector } = ui;

    const rootProps = data.root.props || data.root;
    const currentProps = selectedItem ? selectedItem.props : rootProps;

    const newProps = { ...currentProps, [fieldName]: value };

    if (selectedItem && itemSelector) {
      const resolved = await resolveComponentData(
        { ...selectedItem, props: newProps },
        "replace"
      );

      const latestSelector = getSelectorForId(
        appStore.getState().state,
        selectedItem.props.id
      );
      if (!latestSelector) return;

      dispatch({
        type: "replace",
        destinationIndex: latestSelector.index,
        destinationZone: latestSelector.zone || rootDroppableId,
        data: resolved.node,
        ui: updatedUi,
      });

      return;
    }

    if (data.root.props) {
      dispatch({
        type: "replaceRoot",
        root: (
          await resolveComponentData(
            { ...data.root, props: newProps },
            "replace"
          )
        ).node,
        ui: { ...ui, ...updatedUi },
        recordHistory: true,
      });

      return;
    }

    dispatch({
      type: "setData",
      data: { root: newProps },
    });
  },
  (prevFieldName, prevAppStore) => {
    // Only recreate if dependencies change
    return prevFieldName === prevFieldName;
  }
) as (
  fieldName: string,
  appStore: StoreApi<ReturnType<typeof useAppStore.getState>>
) => (value: any, updatedUi?: Partial<UiState>) => Promise<void>;

const FieldsChildInner = memo(({ fieldName }: { fieldName: string }) => {
  const field = useAppStore((s) => s.fields.fields[fieldName]);
  const isReadOnly = useAppStore(
    useShallow((s) =>
      ((s.selectedItem
        ? s.selectedItem.readOnly
        : s.state.data.root.readOnly) || {})[fieldName]
    )
  );

  const id = useAppStore((s) => {
    if (!field) return null;

    return s.selectedItem
      ? `${s.selectedItem.props.id}_${field.type}_${fieldName}`
      : `root_${field.type}_${fieldName}`;
  });

  const permissions = useAppStore(
    useShallow((s) => {
      const { selectedItem, permissions } = s;

      return selectedItem
        ? permissions.getPermissions({ item: selectedItem })
        : permissions.getPermissions({ root: true });
    })
  );

  const appStore = useAppStoreApi();

  const onChange = useCallback(
    (value: any, updatedUi?: Partial<UiState>) => createOnChange(fieldName, appStore)(value, updatedUi),
    [fieldName, appStore]
  );

  const { visible = true } = field ?? {};

  const fieldStore = useContext(fieldContextStore.ctx);

  useEffect(() => {
    return appStore.subscribe(
      (s) => {
        const data = s.getCurrentData();
        return data.props?.[fieldName];
      },
      (value) => {
        fieldStore.setState({ [fieldName]: value });
      }
    );
  }, [appStore, fieldStore, fieldName]);

  if (!field || !id || !visible) return null;

  if (field.type === "slot") return null;

  return (
    <div key={id} className={getClassName("field")}>
      <AutoFieldPrivate
        field={field}
        name={fieldName}
        id={id}
        readOnly={!permissions.edit || isReadOnly}
        onChange={onChange}
      />
    </div>
  );
});

FieldsChildInner.displayName = "FieldsChildInner";

const FieldsChild = memo(({ fieldName }: { fieldName: string }) => {
  const appStore = useAppStoreApi();

  const initialValue = useMemo(() => {
    const value = appStore.getState().getCurrentData().props?.[fieldName];
    return { [fieldName]: value };
  }, [appStore, fieldName]);

  return (
    <fieldContextStore.Provider value={initialValue}>
      <FieldsChildInner fieldName={fieldName} />
    </fieldContextStore.Provider>
  );
});

FieldsChild.displayName = "FieldsChild";

export type FieldsPanelProps = {
  children?: ReactNode;
  wrapFields?: boolean;
  className?: string;
};

export const FieldsPanel = memo(function FieldsPanel({
  children,
  wrapFields = true,
  className,
}: FieldsPanelProps) {
  const overrides = useAppStore((s) => s.overrides);
  const componentResolving = useAppStore((s) => {
    const loadingCount = s.selectedItem
      ? s.componentState[s.selectedItem.props.id]?.loadingCount
      : s.componentState["root"]?.loadingCount;

    return (loadingCount ?? 0) > 0;
  });

  const itemSelector = useAppStore(useShallow((s) => s.state.ui.itemSelector));
  const id = useAppStore((s) => s.selectedItem?.props.id);
  const appStore = useAppStoreApi();

  // Register fields slice
  useEffect(() => {
    if (id) {
      appStore.getState().registerFieldsSlice?.(id);
    }
  }, [id, appStore]);

  const fieldsLoading = useAppStore((s) => s.fields.loading);
  const fieldNames = useAppStore(
    useShallow((s) => {
      if (s.fields.id === id) {
        return Object.keys(s.fields.fields);
      }
      return [];
    })
  );

  const isLoading = fieldsLoading || componentResolving;

  const Wrapper = useMemo(() => overrides.fields || DefaultFields, [overrides]);

  return (
    <form
      className={getClassName({ wrapFields }, className)}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Wrapper isLoading={isLoading} itemSelector={itemSelector}>
        {children}
        {fieldNames.map((fieldName) => (
          <FieldsChild key={fieldName} fieldName={fieldName} />
        ))}
      </Wrapper>
      {isLoading && (
        <div className={getClassName("loadingOverlay")}>
          <div className={getClassName("loadingOverlayInner")}>
            <Loader size={16} />
          </div>
        </div>
      )}
    </form>
  );
});

FieldsPanel.displayName = "FieldsPanel";
