import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Skip authentication in demo mode
        const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';

        if (!isDemoMode) {
          // Add Telegram init data to headers
          if (window.Telegram?.WebApp?.initData) {
            config.headers.Authorization = `Bearer ${window.Telegram.WebApp.initData}`;
          }
        }

        // Add timestamp for cache busting
        config.headers['X-Timestamp'] = Date.now().toString();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          console.error('Unauthorized access - redirecting to login');
          // In Telegram WebApp, this would typically close or redirect
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert('세션이 만료되었습니다. 다시 시작해주세요.');
            window.Telegram.WebApp.close();
          }
        } else if (error.response?.status >= 500) {
          console.error('Server error:', error.response.data);
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config);
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config);
  }

  // Specific API endpoints
  public async getMissions() {
    return this.get('/missions');
  }

  public async getMissionProgress() {
    return this.get('/missions/progress');
  }

  public async startMission(missionId: string) {
    return this.post(`/missions/${missionId}/start`);
  }

  public async getMissionLogs(missionId: string) {
    return this.get(`/missions/${missionId}/logs`);
  }

  public async getUserProfile() {
    return this.get('/user/profile');
  }

  public async getSBTBadges() {
    return this.get('/sbt/badges');
  }

  public async getReceipts() {
    return this.get('/receipts');
  }

  public async getTransactions() {
    return this.get('/transactions');
  }

  // Health check
  public async healthCheck() {
    return this.get('/health');
  }
}

// Export singleton instance
export const api = new ApiService();
export default api;
