/**
 * HTTP Client
 * عميل HTTP موحد للتواصل مع APIs الخارجية
 */

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

class HTTPClient {
  private baseURL: string;
  private apiKey: string;
  private timeout: number;
  private retries: number;

  constructor(
    baseURL: string,
    apiKey: string,
    timeout = 30000,
    retries = 3
  ) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.timeout = timeout;
    this.retries = retries;
  }

  private async executeWithRetry<T>(
    fn: () => Promise<Response>,
    attempt = 1
  ): Promise<Response> {
    try {
      return await Promise.race([
        fn(),
        new Promise<Response>((_, reject) =>
          setTimeout(
            () => reject(new Error('Request timeout')),
            this.timeout
          )
        ),
      ]);
    } catch (error) {
      if (attempt < this.retries) {
        console.warn(
          `Request failed (attempt ${attempt}/${this.retries}), retrying...`,
          error
        );
        return this.executeWithRetry(fn, attempt + 1);
      }
      throw error;
    }
  }

  async get<T = unknown>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  async post<T = unknown>(
    endpoint: string,
    data: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  async put<T = unknown>(
    endpoint: string,
    data: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  async delete<T = unknown>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  private async request<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...config?.headers,
      };

      const response = await this.executeWithRetry(() =>
        fetch(url, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
        })
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      return {
        success: true,
        data: responseData as T,
        status: response.status,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('HTTP Request Error:', message);

      return {
        success: false,
        error: message,
        status: 0,
      };
    }
  }
}

// Factory functions
export const createHTTPClient = (
  baseURL: string,
  apiKey: string,
  timeout?: number,
  retries?: number
): HTTPClient => {
  return new HTTPClient(baseURL, apiKey, timeout, retries);
};

// Pre-configured clients
export const metaClient = createHTTPClient(
  import.meta.env.VITE_META_API_URL || 'https://graph.instagram.com/v18.0',
  import.meta.env.VITE_META_API_KEY || ''
);

export const googleClient = createHTTPClient(
  import.meta.env.VITE_GOOGLE_API_URL || 'https://www.googleapis.com/admanager',
  import.meta.env.VITE_GOOGLE_API_KEY || ''
);

export const tiktokClient = createHTTPClient(
  import.meta.env.VITE_TIKTOK_API_URL || 'https://business-api.tiktok.com',
  import.meta.env.VITE_TIKTOK_API_KEY || ''
);
