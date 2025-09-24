import { useEffect, useState } from 'react';
import { TelegramWebApp, TelegramUser } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegram = () => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initTelegram = () => {
      if (window.Telegram?.WebApp) {
        const tgWebApp = window.Telegram.WebApp;

        // Expand the WebApp to full height
        tgWebApp.expand();

        // Set theme colors
        tgWebApp.setHeaderColor('#28A745'); // Green theme
        tgWebApp.setBackgroundColor('#ffffff');

        // Enable closing confirmation
        tgWebApp.enableClosingConfirmation();

        setWebApp(tgWebApp);
        setUser(tgWebApp.initDataUnsafe.user || null);
        setIsReady(true);

        // Handle theme changes
        const handleThemeChange = () => {
          // Update theme based on Telegram theme
        };

        tgWebApp.onEvent('themeChanged', handleThemeChange);

        return () => {
          tgWebApp.offEvent('themeChanged', handleThemeChange);
        };
      } else {
        // Fallback for development without Telegram WebApp
        // Create mock user for testing without login
        console.log('Telegram WebApp not available, using mock user for demo mode');
        const mockUser: TelegramUser = {
          id: 123456789,
          first_name: 'Demo',
          last_name: 'User',
          username: 'demo_user',
          language_code: 'ko'
        };

        setUser(mockUser);
        setIsReady(true);
      }
    };

    initTelegram();
  }, []);

  const sendData = (data: string) => {
    if (webApp) {
      webApp.sendData(data);
    }
  };

  const showAlert = (message: string) => {
    if (webApp) {
      webApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showConfirm(message, (confirmed) => resolve(confirmed));
      } else {
        resolve(window.confirm(message));
      }
    });
  };

  const openLink = (url: string) => {
    if (webApp) {
      webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const closeApp = () => {
    if (webApp) {
      webApp.close();
    }
  };

  return {
    webApp,
    user,
    isReady,
    sendData,
    showAlert,
    showConfirm,
    openLink,
    closeApp,
    isInTelegram: !!webApp,
  };
};
