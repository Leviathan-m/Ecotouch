import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface PetitionRequest {
  title: string;
  description: string;
  target_signatures: number;
  category: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface PetitionSignature {
  petition_id: string;
  user_name?: string;
  user_email?: string;
  anonymous: boolean;
  comment?: string;
  signed_at: string;
}

export interface PetitionResponse {
  petition: {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    target_signatures: number;
    current_signatures: number;
    category: string;
    tags: string[];
    creator: {
      id: string;
      name: string;
      organization?: string;
    };
    created_at: string;
    expires_at?: string;
    signatures: PetitionSignature[];
    impact_metrics: {
      reach: number;
      engagement: number;
      media_coverage: number;
    };
  };
}

export class PetitionService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NATION_BUILDER_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('NATION_BUILDER_API_KEY not configured - petition features will be limited');
    }

    this.client = axios.create({
      baseURL: 'https://api.nationbuilder.com/api/v2',
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('NationBuilder API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    );
  }

  /**
   * Get available petition categories
   */
  async getCategories(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    color: string;
  }>> {
    // For now, return mock categories since NationBuilder API might not be configured
    logger.info('Returning mock petition categories');
    return [
      {
        id: 'environment',
        name: '환경 보호',
        description: '환경 문제 해결을 위한 청원',
        color: '#28a745',
      },
      {
        id: 'social',
        name: '사회 정의',
        description: '사회적 불평등 해소를 위한 청원',
        color: '#007bff',
      },
      {
        id: 'education',
        name: '교육',
        description: '교육 개선을 위한 청원',
        color: '#ffc107',
      },
      {
        id: 'human_rights',
        name: '인권',
        description: '인권 보호 및 증진을 위한 청원',
        color: '#dc3545',
      },
    ];
  }

  /**
   * Create a new petition
   */
  async createPetition(request: PetitionRequest): Promise<PetitionResponse> {
    try {
      logger.info('Creating petition:', request);

      const response = await this.client.post('/petitions', {
        petition: request,
      });

      logger.info('Petition created successfully:', {
        id: response.data.petition.id,
        title: response.data.petition.title,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create petition:', error);
      throw new Error('청원 생성에 실패했습니다');
    }
  }

  /**
   * Get petition details
   */
  async getPetition(petitionId: string): Promise<PetitionResponse> {
    try {
      const response = await this.client.get(`/petitions/${petitionId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get petition:', error);
      throw new Error('청원 조회에 실패했습니다');
    }
  }

  /**
   * Get active petitions
   */
  async getActivePetitions(limit: number = 10): Promise<PetitionResponse[]> {
    try {
      const response = await this.client.get('/petitions', {
        params: {
          status: 'active',
          limit,
          sort: '-created_at',
        },
      });

      return response.data.petitions || [];
    } catch (error) {
      logger.error('Failed to get active petitions:', error);
      // Return mock petitions for development
      return [
        {
          petition: {
            id: 'petition_001',
            title: '플라스틱 사용 금지 법안 통과 촉구',
            description: '일회용 플라스틱 사용을 전면 금지하는 법안을 통과시켜 달라.',
            status: 'active',
            target_signatures: 10000,
            current_signatures: 3250,
            category: 'environment',
            tags: ['환경', '플라스틱', '법안'],
            creator: {
              id: 'org_001',
              name: '환경보호시민단체',
              organization: 'Green Korea Alliance',
            },
            created_at: new Date().toISOString(),
            signatures: [],
            impact_metrics: {
              reach: 15000,
              engagement: 850,
              media_coverage: 12,
            },
          },
        },
        {
          petition: {
            id: 'petition_002',
            title: '대중교통 요금 인하 요구',
            description: '경제적으로 어려운 시민들을 위해 대중교통 요금을 인하해 달라.',
            status: 'active',
            target_signatures: 5000,
            current_signatures: 1200,
            category: 'social',
            tags: ['교통', '경제', '복지'],
            creator: {
              id: 'org_002',
              name: '시민참여단체',
              organization: 'People First',
            },
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            signatures: [],
            impact_metrics: {
              reach: 8000,
              engagement: 320,
              media_coverage: 5,
            },
          },
        },
      ];
    }
  }

  /**
   * Sign a petition
   */
  async signPetition(petitionId: string, signature: Omit<PetitionSignature, 'petition_id' | 'signed_at'>): Promise<{
    success: boolean;
    signature_id: string;
    message: string;
  }> {
    try {
      logger.info('Signing petition:', { petitionId, signature });

      const response = await this.client.post(`/petitions/${petitionId}/signatures`, {
        signature: {
          ...signature,
          petition_id: petitionId,
        },
      });

      logger.info('Petition signed successfully:', {
        petitionId,
        signatureId: response.data.signature.id,
      });

      return {
        success: true,
        signature_id: response.data.signature.id,
        message: '청원 서명 완료되었습니다',
      };
    } catch (error) {
      logger.error('Failed to sign petition:', error);
      throw new Error('청원 서명에 실패했습니다');
    }
  }

  /**
   * Get petition signatures
   */
  async getSignatures(petitionId: string, page: number = 1, limit: number = 50): Promise<{
    signatures: PetitionSignature[];
    total_count: number;
    page: number;
    limit: number;
  }> {
    try {
      const response = await this.client.get(`/petitions/${petitionId}/signatures`, {
        params: { page, limit },
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get signatures:', error);
      return {
        signatures: [],
        total_count: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Update petition status
   */
  async updatePetitionStatus(petitionId: string, status: 'active' | 'completed' | 'cancelled'): Promise<void> {
    try {
      await this.client.patch(`/petitions/${petitionId}`, {
        petition: { status },
      });

      logger.info('Petition status updated:', { petitionId, status });
    } catch (error) {
      logger.error('Failed to update petition status:', error);
      throw new Error('청원 상태 업데이트에 실패했습니다');
    }
  }

  /**
   * Get petition impact metrics
   */
  async getImpactMetrics(petitionId: string): Promise<{
    signatures_gained: number;
    social_media_shares: number;
    media_mentions: number;
    policy_changes: number;
  }> {
    try {
      const response = await this.client.get(`/petitions/${petitionId}/impact`);
      return response.data.metrics || {};
    } catch (error) {
      logger.error('Failed to get impact metrics:', error);
      // Return mock metrics for development
      return {
        signatures_gained: 1250,
        social_media_shares: 450,
        media_mentions: 8,
        policy_changes: 0,
      };
    }
  }

  /**
   * Validate API key
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.get('/account');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const petitionService = new PetitionService();
export default petitionService;
