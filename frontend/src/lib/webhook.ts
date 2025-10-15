import { Settings } from '../hooks/useSettings';

export function generateWebhookUrl(settings: Settings): string {
  if (!settings.githubOwner || !settings.githubRepo) {
    return '';
  }
  return `https://api.github.com/repos/${settings.githubOwner}/${settings.githubRepo}/dispatches`;
}

export function isSettingsConfigured(settings: Settings): boolean {
  return !!(settings.githubToken && settings.githubOwner && settings.githubRepo);
}

export function maskToken(token: string): string {
  if (!token || token.length < 8) {
    return '****';
  }
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
}
