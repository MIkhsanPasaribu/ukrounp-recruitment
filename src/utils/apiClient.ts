import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import pTimeout from "p-timeout";
import pRetry from "p-retry";

interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class ApiClient {
  private instance: AxiosInstance;
  private retries: number;
  private retryDelay: number;

  constructor(config: ApiClientConfig = {}) {
    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000;

    this.instance = axios.create({
      baseURL: config.baseURL || "",
      timeout: config.timeout || 30000, // 30 seconds
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.instance.interceptors.request.use((config) => {
      const token = this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers["X-Admin-Token"] = token;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken");
    }
    return null;
  }

  private async makeRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    timeoutMs: number = 30000
  ): Promise<T> {
    const timeoutPromise = pTimeout(requestFn(), {
      milliseconds: timeoutMs,
      message: `Request timed out after ${timeoutMs}ms`,
    });

    const retryPromise = pRetry(
      async () => {
        try {
          const response = await timeoutPromise;
          return response.data;
        } catch (error) {
          // Only retry on network errors or 5xx server errors
          if (
            axios.isAxiosError(error) &&
            (error.code === "ECONNABORTED" ||
              error.code === "NETWORK_ERROR" ||
              (error.response && error.response.status >= 500))
          ) {
            throw error;
          }
          // Don't retry on 4xx client errors
          const abortError = new Error(
            error instanceof Error ? error.message : "Client error"
          );
          Object.assign(abortError, { isAbortError: true });
          throw abortError;
        }
      },
      {
        retries: this.retries,
        minTimeout: this.retryDelay,
        maxTimeout: this.retryDelay * 3,
        onFailedAttempt: (error) => {
          console.warn(
            `Request attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`
          );
        },
      }
    );

    return retryPromise;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.makeRequest(() => this.instance.get<T>(url, config));
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.makeRequest(() => this.instance.post<T>(url, data, config));
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.makeRequest(() => this.instance.put<T>(url, data, config));
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.makeRequest(() => this.instance.delete<T>(url, config));
  }

  // Upload file dengan progress tracking
  async uploadFile<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return this.makeRequest(
      () =>
        this.instance.post<T>(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        }),
      60000 // 60 seconds for file uploads
    );
  }

  // Download file dengan progress tracking
  async downloadFile(
    url: string,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const response = await this.makeRequest(
      () =>
        this.instance.get(url, {
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        }),
      60000 // 60 seconds for downloads
    );
    return response;
  }
}

// Create default instance
export const apiClient = new ApiClient({
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
});

// Helper untuk admin API calls
export const adminApi = {
  updateStatus: (id: string, status: string) =>
    apiClient.post("/api/admin/update-status", { id, status }),

  getApplicationDetail: (id: string) =>
    apiClient.get(`/api/admin/applications/${id}/detailed`),

  deleteApplication: (id: string) =>
    apiClient.post("/api/admin/delete-application", { id }),

  downloadPDF: (id: string) =>
    apiClient.downloadFile(`/api/admin/download-pdf/${id}`),

  getFile: (applicationId: string, fieldName: string) =>
    apiClient.get(`/api/admin/files/${applicationId}/${fieldName}`),
};
