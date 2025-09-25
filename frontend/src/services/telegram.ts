// Telegram WebApp SDK wrapper
import { TelegramWebApp, TelegramUser } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export class TelegramService {
  private webApp: TelegramWebApp | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      this.setupWebApp();
    }
  }

  private setupWebApp() {
    if (!this.webApp) return;

    // Expand to full height
    this.webApp.expand();

    // Set theme colors (Eco Touch green theme)
    try { (this.webApp as any).setHeaderColor?.('#28A745'); } catch {}
    try { (this.webApp as any).setBackgroundColor?.('#ffffff'); } catch {}

    // Enable closing confirmation
    try { (this.webApp as any).enableClosingConfirmation?.(); } catch {}

    // Handle viewport changes
    this.webApp.onEvent('viewportChanged', () => {
      // Handle viewport changes if needed
    });
  }

  public getWebApp(): TelegramWebApp | null {
    return this.webApp;
  }

  public getUser(): TelegramUser | null {
    return this.webApp?.initDataUnsafe.user || null;
  }

  public getInitData(): string {
    return this.webApp?.initData || '';
  }

  public isInTelegram(): boolean {
    return !!this.webApp;
  }

  public getPlatform(): string {
    return this.webApp?.platform || 'unknown';
  }

  public getColorScheme(): 'light' | 'dark' {
    return this.webApp?.colorScheme || 'light';
  }

  public sendData(data: string): void {
    if (this.webApp) {
      this.webApp.sendData(data);
    }
  }

  public showAlert(message: string): void {
    if (this.webApp) {
      this.webApp.showAlert(message);
    } else {
      alert(message);
    }
  }

  public showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.webApp) {
        this.webApp.showConfirm(message, (confirmed) => resolve(confirmed));
      } else {
        resolve(window.confirm(message));
      }
    });
  }

  public showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id: string;
      type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }): Promise<string> {
    return new Promise((resolve) => {
      if (this.webApp) {
        this.webApp.showPopup(params, (buttonId) => resolve(buttonId));
      } else {
        // Fallback to browser confirm
        const confirmed = window.confirm(params.message);
        resolve(confirmed ? 'ok' : 'cancel');
      }
    });
  }

  public openLink(url: string): void {
    if (this.webApp) {
      this.webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  public close(): void {
    if (this.webApp) {
      this.webApp.close();
    }
  }

  // Utility methods
  public vibrate(pattern: 'light' | 'medium' | 'heavy' | number[]): void {
    // Haptic feedback is not directly available in WebApp API
    // but can be simulated or extended if needed
  }

  public getViewportHeight(): number {
    return this.webApp?.viewportHeight || window.innerHeight;
  }

  public isExpanded(): boolean {
    return this.webApp?.isExpanded || false;
  }

  public expand(): void {
    if (this.webApp) {
      this.webApp.expand();
    }
  }
}

// Export singleton instance
export const telegramService = new TelegramService();
export default telegramService;
