import { useState, useCallback } from 'react';

const STORAGE_KEY = 'mohe_conversation_history';
const MAX_ENTRIES = 20;

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore storage quota errors
  }
}

export function useConversationHistory() {
  const [history, setHistory] = useState(() => loadHistory());

  const addConversation = useCallback(({ query, aiMessage, resultPreviews }) => {
    if (!query) return;
    setHistory(prev => {
      // Remove duplicate query entry if exists (re-searches update in place)
      const filtered = prev.filter(e => e.query !== query);
      const newEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        query,
        aiMessage,
        resultPreviews: (resultPreviews || []).slice(0, 3),
        timestamp: new Date().toISOString(),
      };
      const next = [newEntry, ...filtered].slice(0, MAX_ENTRIES);
      saveHistory(next);
      return next;
    });
  }, []);

  const removeEntry = useCallback((id) => {
    setHistory(prev => {
      const next = prev.filter(e => e.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return { history, addConversation, removeEntry, clearHistory };
}
