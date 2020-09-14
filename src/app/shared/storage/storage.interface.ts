export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: unknown): void;
  removeItem(key: string): void;
}
