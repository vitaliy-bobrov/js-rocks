import { Injectable } from '@angular/core';
import { Storage } from './storage.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService implements Storage {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  setItem(key: string, value: unknown): void {
    const normalizedValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, normalizedValue);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
