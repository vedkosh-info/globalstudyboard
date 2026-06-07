"use client";

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gsb_recent_pages';
const MAX_ITEMS = 10;

export interface HistoryItem {
  path: string;
  title: string;
  visitedAt: number;
}

function read(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p: unknown): p is HistoryItem =>
        typeof p === 'object' && p !== null &&
        typeof (p as HistoryItem).path === 'string' &&
        typeof (p as HistoryItem).title === 'string'
    ).map((p: HistoryItem) => ({ ...p, visitedAt: p.visitedAt || 0 }));
  } catch {
    return [];
  }
}

function write(items: HistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* storage full or denied */ }
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(read());
  }, []);

  const addToHistory = useCallback((path: string, title: string) => {
    setHistory((prev) => {
      if (prev[0]?.path === path) return prev;
      const filtered = prev.filter((item) => item.path !== path);
      const updated = [{ path, title, visitedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      write(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
}
