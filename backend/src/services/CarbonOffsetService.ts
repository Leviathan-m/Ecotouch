import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface CarbonOffsetRequest {
  weight: number; // kg of CO2
  weight_unit: 'kg' | 'tonne';
  currency: 'KRW' | 'USD';
  bundle?: string; // Specific project bundle
}

export interface CarbonOffsetResponse {
  offset: {
    id: string;
    status: 'pending' | 'completed' | 'failed';
    weight: number;
    weight_unit: string;
    currency: string;
    amount: number;
    total_cost: number;
    project_name: string;
    project_developer: string;
    country: string;
    project_type: string;
    registry: string;
    registry_id: string;
    certificates: Array<{
      id: string;
      url: string;
    }>;
  };
}

export class CarbonOffsetService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.CLOVERLY_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('CLOVERLY_API_KEY not configured - carbon offset features will be limited');
    }

    this.client = axios.create({
      baseURL: 'https://api.cloverly.com',
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
        logger.error('Cloverly API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    );
  }

  /**
   * Calculate carbon offset cost without purchasing
   */
  async calculateOffset(request: CarbonOffsetRequest): Promise<{
    cost: number;
    currency: string;
    equivalent_trees: number;
  }> {
    try {
      const response = await this.client.get('/2022-11/estimates/offset', {
        params: request,
      });

      return {
        cost: response.data.offset.total_cost,
        currency: response.data.offset.currency,
        equivalent_trees: response.data.offset.equivalent_trees || 0,
      };
    } catch (error) {
      logger.error('Failed to calculate carbon offset:', error);
      throw new Error('탄소상쇄 비용 계산에 실패했습니다');
    }
  }

  /**
   * Purchase carbon offset
   */
  async purchaseOffset(request: CarbonOffsetRequest): Promise<CarbonOffsetResponse> {
    try {
      logger.info('Purchasing carbon offset:', request);

      const response = await this.client.post('/2022-11/purchases/offset', request);

      logger.info('Carbon offset purchased successfully:', {
        id: response.data.offset.id,
        cost: response.data.offset.total_cost,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to purchase carbon offset:', error);
      throw new Error('탄소상쇄 구매에 실패했습니다');
    }
  }

  /**
   * Get offset details by ID
   */
  async getOffsetDetails(offsetId: string): Promise<CarbonOffsetResponse> {
    try {
      const response = await this.client.get(`/2022-11/purchases/offset/${offsetId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get offset details:', error);
      throw new Error('탄소상쇄 내역 조회에 실패했습니다');
    }
  }

  /**
   * Get available offset projects
   */
  async getProjects(): Promise<Array<{
    id: string;
    name: string;
    developer: string;
    country: string;
    type: string;
    registry: string;
  }>> {
    try {
      const response = await this.client.get('/2022-11/projects');
      return response.data.projects || [];
    } catch (error) {
      logger.error('Failed to get projects:', error);
      return [];
    }
  }

  /**
   * Validate API key
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.get('/2022-11/account');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const carbonOffsetService = new CarbonOffsetService();
export default carbonOffsetService;
