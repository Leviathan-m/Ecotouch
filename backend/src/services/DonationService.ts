import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface DonationRequest {
  amount: number;
  currency: 'KRW' | 'USD';
  recipient_id?: string; // Specific charity ID
  anonymous?: boolean;
  metadata?: Record<string, any>;
}

export interface DonationResponse {
  donation: {
    id: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    amount: number;
    currency: string;
    recipient: {
      id: string;
      name: string;
      description: string;
      category: string;
    };
    donor?: {
      id: string;
      name?: string;
      email?: string;
    };
    transaction_id: string;
    created_at: string;
    completed_at?: string;
    receipt_url?: string;
    impact_metrics?: {
      people_helped: number;
      meals_provided: number;
      trees_planted: number;
    };
  };
}

export class DonationService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ONE_CLICK_IMPACT_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('ONE_CLICK_IMPACT_API_KEY not configured - donation features will be limited');
    }

    this.client = axios.create({
      baseURL: 'https://api.1clickimpact.com/v1',
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('1ClickImpact API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    );
  }

  /**
   * Get available charities
   */
  async getCharities(category?: string): Promise<Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    country: string;
    rating: number;
    impact_metrics: {
      total_raised: number;
      people_helped: number;
      projects_completed: number;
    };
  }>> {
    // Return mock data for development since 1ClickImpact API key is not configured
    logger.info('Returning mock charities data');

    const allCharities = [
      {
        id: 'charity_001',
        name: '세계 빈곤 퇴치 단체',
        description: '전 세계 빈곤 지역의 아이들에게 교육과 식량을 제공합니다.',
        category: 'education',
        country: 'Global',
        rating: 4.8,
        impact_metrics: {
          total_raised: 2500000,
          people_helped: 50000,
          projects_completed: 120,
        },
      },
      {
        id: 'charity_002',
        name: '환경 보호 협회',
        description: '지구 환경 보호와 지속 가능한 발전을 위한 활동을 합니다.',
        category: 'environment',
        country: 'Korea',
        rating: 4.6,
        impact_metrics: {
          total_raised: 1800000,
          people_helped: 75000,
          projects_completed: 85,
        },
      },
      {
        id: 'charity_003',
        name: '국제 적십자사',
        description: '재난 구호와 인도주의 활동을 지원합니다.',
        category: 'disaster_relief',
        country: 'Global',
        rating: 4.9,
        impact_metrics: {
          total_raised: 5000000,
          people_helped: 200000,
          projects_completed: 500,
        },
      },
      {
        id: 'charity_004',
        name: '어린이 보호 단체',
        description: '학대받는 어린이들을 보호하고 지원합니다.',
        category: 'children',
        country: 'Korea',
        rating: 4.7,
        impact_metrics: {
          total_raised: 1200000,
          people_helped: 15000,
          projects_completed: 200,
        },
      },
    ];

    // Filter by category if specified
    if (category) {
      return allCharities.filter(charity => charity.category === category);
    }

    return allCharities;
  }

  /**
   * Create a donation
   */
  async createDonation(request: DonationRequest): Promise<DonationResponse> {
    try {
      logger.info('Creating donation:', request);

      const response = await this.client.post('/donations', request);

      logger.info('Donation created successfully:', {
        id: response.data.donation.id,
        amount: response.data.donation.amount,
        currency: response.data.donation.currency,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create donation:', error);
      throw new Error('기부 생성에 실패했습니다');
    }
  }

  /**
   * Process donation payment
   */
  async processDonation(donationId: string, paymentMethod: {
    type: 'card' | 'bank_transfer' | 'crypto';
    token?: string; // For card payments
    wallet_address?: string; // For crypto payments
  }): Promise<{
    status: 'success' | 'pending' | 'failed';
    transaction_id: string;
    receipt_url?: string;
  }> {
    try {
      logger.info('Processing donation payment:', { donationId, paymentMethod });

      const response = await this.client.post(`/donations/${donationId}/process`, {
        payment_method: paymentMethod,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to process donation:', error);
      throw new Error('기부 결제 처리에 실패했습니다');
    }
  }

  /**
   * Get donation details
   */
  async getDonation(donationId: string): Promise<DonationResponse> {
    try {
      const response = await this.client.get(`/donations/${donationId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get donation details:', error);
      throw new Error('기부 내역 조회에 실패했습니다');
    }
  }

  /**
   * Get donation impact metrics
   */
  async getImpactMetrics(donationId: string): Promise<{
    people_helped: number;
    meals_provided: number;
    education_provided: number;
    environmental_impact: number;
  }> {
    try {
      const response = await this.client.get(`/donations/${donationId}/impact`);
      return response.data.metrics || {};
    } catch (error) {
      logger.error('Failed to get impact metrics:', error);
      // Return mock metrics for development
      return {
        people_helped: 5,
        meals_provided: 25,
        education_provided: 2,
        environmental_impact: 10,
      };
    }
  }

  /**
   * Generate tax receipt for donation
   */
  async generateReceipt(donationId: string): Promise<{
    receipt_number: string;
    receipt_url: string;
    tax_deductible_amount: number;
    issued_at: string;
  }> {
    try {
      const response = await this.client.post(`/donations/${donationId}/receipt`);
      return response.data;
    } catch (error) {
      logger.error('Failed to generate receipt:', error);
      throw new Error('기부금 영수증 발급에 실패했습니다');
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
export const donationService = new DonationService();
export default donationService;
