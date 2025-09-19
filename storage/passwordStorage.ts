import * as FileSystem from "expo-file-system/legacy";

export interface PasswordRecord {
  id: string;
  label: string;
  username: string;
  encryptedPassword: string;
  createdAt: string;
}

type MaybeStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const FILE_NAME = "passwords.json";
const WEB_STORAGE_KEY = "passwordRecords";

const getLocalStorage = (): MaybeStorage | null => {
  try {
    if (typeof globalThis !== "undefined" && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage as MaybeStorage;
    }
  } catch (error) {
    console.warn("Local storage is not available:", error);
  }

  return null;
};

const getFileUri = (): string | null => {
  const directory = FileSystem.documentDirectory;
  if (!directory) {
    return null;
  }

  return `${directory}${FILE_NAME}`;
};

const ensureFileExists = async (): Promise<void> => {
  const fileUri = getFileUri();

  if (!fileUri) {
    return;
  }

  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (!fileInfo.exists) {
    await FileSystem.writeAsStringAsync(fileUri, "[]");
  }
};

export const loadPasswordRecords = async (): Promise<PasswordRecord[]> => {
  const storage = getLocalStorage();
  const fileUri = getFileUri();

  if (!fileUri && !storage) {
    console.warn("No persistent storage available. Falling back to in-memory state.");
    return [];
  }

  if (fileUri) {
    await ensureFileExists();
    try {
      const content = await FileSystem.readAsStringAsync(fileUri);
      const parsed = JSON.parse(content) as PasswordRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to read password records from file:", error);
      return [];
    }
  }

  if (storage) {
    try {
      const raw = storage.getItem(WEB_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as PasswordRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to read password records from localStorage:", error);
      return [];
    }
  }

  return [];
};

export const persistPasswordRecords = async (
  records: PasswordRecord[],
): Promise<void> => {
  const storage = getLocalStorage();
  const fileUri = getFileUri();

  if (!fileUri && !storage) {
    throw new Error("Unable to persist password records. No supported storage backend.");
  }

  const serialised = JSON.stringify(records, null, 2);

  if (fileUri) {
    await FileSystem.writeAsStringAsync(fileUri, serialised);
    return;
  }

  storage?.setItem(WEB_STORAGE_KEY, serialised);
};
