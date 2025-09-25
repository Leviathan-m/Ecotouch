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
      const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';

      if (window.Telegram?.WebApp && !isDemoMode) {
        const tgWebApp = window.Telegram.WebApp;

        // Expand the WebApp to full height
        tgWebApp.expand();

        // Set theme colors (compat: older SDKs may expose properties not methods)
        try { (tgWebApp as any).setHeaderColor?.('#28A745'); } catch {}
        try { (tgWebApp as any).setBackgroundColor?.('#ffffff'); } catch {}

        // Enable closing confirmation
        try { (tgWebApp as any).enableClosingConfirmation?.(); } catch {}

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
        // Demo mode or development without Telegram WebApp
        console.log('🧪 Demo mode activated - bypassing Telegram authentication');

        const mockUser: TelegramUser = {
          id: 123456789,
          first_name: 'Demo',
          last_name: 'User',
          username: 'demo_user',
          language_code: 'ko'
        };

        setUser(mockUser);
        setIsReady(true);

        // Mock webApp for demo functionality
        const mockWebApp: TelegramWebApp = {
          initData: '',
          initDataUnsafe: { user: mockUser, auth_date: Date.now()/1000 as any, hash: '' as any } as any,
          version: '6.0',
          platform: 'demo',
          colorScheme: 'light',
          themeParams: {
            bg_color: '#ffffff',
            text_color: '#000000',
            hint_color: '#999999',
            link_color: '#28A745',
            button_color: '#28A745',
            button_text_color: '#ffffff'
          },
          isExpanded: true,
          viewportHeight: window.innerHeight,
          viewportStableHeight: window.innerHeight,
          headerColor: '#28A745',
          backgroundColor: '#ffffff',
          BackButton: {
            show: () => {},
            hide: () => {},
            onClick: () => {}
          },
          MainButton: {
            text: 'Demo Button',
            color: '#28A745',
            textColor: '#ffffff',
            isVisible: false,
            isActive: true,
            show: () => {},
            hide: () => {},
            enable: () => {},
            disable: () => {},
            onClick: () => {},
            setText: () => {},
            showProgress: () => {},
            hideProgress: () => {}
          },
          HapticFeedback: {
            impactOccurred: () => {},
            notificationOccurred: () => {},
            selectionChanged: () => {}
          },
          expand: () => {},
          close: () => {},
          sendData: () => {},
          openLink: () => {},
          openTelegramLink: () => {},
          showAlert: () => {},
          showConfirm: () => {},
          showScanQrPopup: () => {},
          closeScanQrPopup: () => {},
          readTextFromClipboard: () => Promise.resolve(''),
          requestWriteAccess: () => Promise.resolve(false),
          requestContact: () => Promise.resolve(null),
          ready: () => {},
          setHeaderColor: () => {},
          setBackgroundColor: () => {},
          enableClosingConfirmation: () => {},
          disableClosingConfirmation: () => {},
          onEvent: () => {},
          offEvent: () => {},
          sendEvent: () => {}
        };

        setWebApp(mockWebApp);
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
