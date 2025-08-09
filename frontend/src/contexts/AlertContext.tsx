/* eslint-disable @typescript-eslint/no-unused-expressions */
// src/contexts/AlertContext.tsx
import React, { createContext, useContext, useState } from "react";
import OneBtnModal from "../components/modals/OneBtnModal";
import TwoBtnModal from "../components/modals/TwoBtnModal";

//
// 1) 팝업 옵션 타입
//
interface AlertOptions {
  content: string;
  confirmLabel?: string;
  onConfirm?: () => void;
}

interface ConfirmOptions {
  content: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface DeleteOptions {
  content: string;
  deleteLabel?: string;
  confirmLabel?: string;
  onDelete?: () => void;
  onConfirm?: () => void;
}

type DialogType = "alert" | "confirm" | "delete" | null;

//
// 2) 컨텍스트 밸류에 새로운 이름 할당
//
interface AlertContextValue {
  customAlert: (opts: AlertOptions) => Promise<void>;
  customConfirm: (opts: ConfirmOptions) => Promise<boolean>;
  customDestroy: (opts: DeleteOptions) => Promise<"delete" | "confirm">;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [options, setOptions] = useState<
    AlertOptions | ConfirmOptions | DeleteOptions | null
  >(null);
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);

  // customAlert
  const customAlert = (opts: AlertOptions) =>
    new Promise<void>((resolve) => {
      setDialogType("alert");
      setOptions(opts);
      setResolver(() => resolve);
    });

  // customConfirm
  const customConfirm = (opts: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      setDialogType("confirm");
      setOptions(opts);
      setResolver(() => resolve);
    });

  // customDestroy
  const customDestroy = (opts: DeleteOptions) =>
    new Promise<"delete" | "confirm">((resolve) => {
      setDialogType("delete");
      setOptions(opts);
      setResolver(() => resolve);
    });

  // 각 팝업의 버튼 핸들러
  const handleAlertConfirm = () => {
    (options as AlertOptions).onConfirm?.();
    resolver?.(undefined);
    cleanup();
  };

  const handleConfirmChoice = (ok: boolean) => {
    const opts = options as ConfirmOptions;
    ok ? opts.onConfirm?.() : opts.onCancel?.();
    resolver?.(ok);
    cleanup();
  };

  const handleDeleteChoice = (which: "delete" | "confirm") => {
    const opts = options as DeleteOptions;
    which === "delete" ? opts.onDelete?.() : opts.onConfirm?.();
    resolver?.(which);
    cleanup();
  };

  const cleanup = () => {
    setDialogType(null);
    setOptions(null);
    setResolver(null);
  };

  return (
    <AlertContext.Provider
      value={{ customAlert, customConfirm, customDestroy }}
    >
      {children}

      {dialogType === "alert" && options && (
        <OneBtnModal
          isOpen
          onOpenChange={cleanup}
          content={(options as AlertOptions).content}
          confirmBtnLabel={(options as AlertOptions).confirmLabel ?? "확인"}
          confirmEvent={handleAlertConfirm}
        />
      )}

      {dialogType === "confirm" && options && (
        <TwoBtnModal
          isOpen
          onOpenChange={cleanup}
          content={(options as ConfirmOptions).content}
          confirmBtnLabel={(options as ConfirmOptions).confirmLabel ?? "확인"}
          cancelBtnLabel={(options as ConfirmOptions).cancelLabel ?? "취소"}
          confirmEvent={() => handleConfirmChoice(true)}
          cancelEvent={() => handleConfirmChoice(false)}
        />
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextValue => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used within AlertProvider");
  return ctx;
};
