import { useState, useEffect } from 'react';

const STORAGE_KEY = 'devops-dashboard-settings';

export interface Settings {
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    githubToken: '',
    githubOwner: '',
    githubRepo: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse settings from localStorage:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    settings,
    updateSettings,
  };
}
