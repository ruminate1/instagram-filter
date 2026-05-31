import browser from "webextension-polyfill";

export interface Settings {
  enabled: boolean;
  debug: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  debug: false,
};

const STORAGE_KEY = "settings";

export async function getSettings(): Promise<Settings> {
  const result = await browser.storage.sync.get(STORAGE_KEY);
  const stored = result[STORAGE_KEY] as Partial<Settings> | undefined;
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function setSettings(patch: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  const next: Settings = { ...current, ...patch };
  await browser.storage.sync.set({ [STORAGE_KEY]: next });
}

export type SettingsListener = (settings: Settings) => void;

export function onSettingsChanged(listener: SettingsListener): () => void {
  const wrapped = (
    changes: Record<string, browser.Storage.StorageChange>,
    areaName: string,
  ) => {
    if (areaName !== "sync") return;
    if (!(STORAGE_KEY in changes)) return;
    const newValue = changes[STORAGE_KEY].newValue as
      | Partial<Settings>
      | undefined;
    listener({ ...DEFAULT_SETTINGS, ...newValue });
  };
  browser.storage.onChanged.addListener(wrapped);
  return () => browser.storage.onChanged.removeListener(wrapped);
}
