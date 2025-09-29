import api from './api';

export interface SharePayload {
  type?: 'badge' | 'progress' | 'mission' | 'general';
  title?: string;
  text?: string;
  url?: string;
  meta?: Record<string, any>;
}

export interface ShareResult {
  slug: string;
  shareUrl: string;
  title: string;
  text: string;
  type: string;
  meta: Record<string, any>;
}

export const shareService = {
  async createShareLink(payload: SharePayload): Promise<ShareResult> {
    const res = await api.post('/share', payload);
    return res.data.data;
  },

  async share(payload: SharePayload): Promise<ShareResult> {
    const data = await this.createShareLink(payload);

    // Try Web Share API first
    const shareData: ShareData = {
      title: data.title || 'Eco Touch',
      text: payload.text || data.text || '나의 Eco Touch 임팩트를 확인해 보세요!',
      url: data.shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if ((window as any).Telegram?.WebApp?.openLink) {
        (window as any).Telegram.WebApp.openLink(data.shareUrl);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(data.shareUrl);
        alert('공유 링크가 클립보드에 복사되었습니다.');
      }
    } catch (err) {
      // If share canceled or failed, still return the link
      console.warn('Share canceled or failed:', err);
    }

    return data;
  },
};

export default shareService;


