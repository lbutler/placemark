import { useMapKeybindings } from "app/hooks/use_map_keybindings";
import { useOpenFiles } from "app/hooks/use_open_files";
import { useHotkeys } from "integrations/hotkeys";
import useFileSave from "app/hooks/use_file_save";
import { useSetAtom } from "jotai";
import * as Sentry from "@sentry/nextjs";
import { dialogAtom } from "state/jotai";
import toast from "react-hot-toast";
import { posthog } from "integrations/posthog_client";

export function Keybindings() {
  const setDialogState = useSetAtom(dialogAtom);
  const saveNative = useFileSave();
  const openFiles = useOpenFiles();

  useMapKeybindings();

  useHotkeys(
    "/",
    (e) => {
      e.preventDefault();
      setDialogState({ type: "quickswitcher" });
      posthog.capture("open-quickswitcher", {
        method: "keybinding",
      });
    },
    [setDialogState]
  );

  useHotkeys(
    "meta+k, Ctrl+k",
    (e) => {
      e.preventDefault();
      setDialogState({ type: "quickswitcher" });
      posthog.capture("open-quickswitcher", {
        method: "keybinding",
      });
    },
    [setDialogState]
  );

  useHotkeys(
    "meta+shift+s, Ctrl+shift+s",
    (e) => {
      // Don't type a / in the input.
      e.preventDefault();
      setDialogState({
        type: "export",
      });
      posthog.capture("open-export", {
        method: "keybinding",
      });
    },
    [setDialogState]
  );

  useHotkeys(
    "Shift+/",
    (e) => {
      // Don't type a / in the input.
      e.preventDefault();
      setDialogState((modalState) => {
        if (modalState) return modalState;
        return {
          type: "cheatsheet",
        };
      });
      posthog.capture("open-cheatsheet", {
        method: "keybinding",
      });
    },
    [setDialogState]
  );

  useHotkeys(
    "meta+s, Ctrl+s",
    (e) => {
      e.preventDefault();
      posthog.capture("open-export-dialog", {
        method: "keybinding",
      });
      (async () => {
        const either = await saveNative();
        return either
          .ifLeft((error) => toast.error(error?.message || "Could not save"))
          .map((saved) => {
            if (saved) return;
            setDialogState({
              type: "export",
            });
          });
      })().catch((e) => Sentry.captureException(e));
    },
    [setDialogState, saveNative]
  );

  useHotkeys(
    "meta+o, Ctrl+o",
    (e) => {
      e.preventDefault();
      posthog.capture("open-import-dialog", {
        method: "keybinding",
      });
      openFiles().catch((e) => Sentry.captureException(e));
    },
    [openFiles]
  );

  return null;
}
