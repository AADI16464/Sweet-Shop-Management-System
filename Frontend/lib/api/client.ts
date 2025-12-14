const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface User {
  id: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
}

export interface Sweet {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  quantity: number;
  imageUrl: string | null;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  private setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
  }

  private removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: headers as HeadersInit,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T;
      }

      return response.json();
    } catch (error) {
      // Handle network errors (connection refused, etc.)
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          `Cannot connect to backend server at ${this.baseUrl}. Please make sure the backend is running on port 4000.`
        );
      }
      throw error;
    }
  }

  // Auth methods
  async register(email: string, password: string, displayName?: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, displayName }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  logout(): void {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Sweet methods
  async getSweets(): Promise<Sweet[]> {
    return this.request<Sweet[]>("/api/sweets", {
      method: "GET",
    });
  }

  async searchSweets(params: {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Sweet[]> {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append("q", params.q);
    if (params.category) queryParams.append("category", params.category);
    if (params.minPrice !== undefined) queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append("maxPrice", params.maxPrice.toString());

    return this.request<Sweet[]>(`/api/sweets/search?${queryParams.toString()}`, {
      method: "GET",
    });
  }

  async createSweet(sweet: {
    name: string;
    description?: string;
    category?: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }): Promise<Sweet> {
    return this.request<Sweet>("/api/sweets", {
      method: "POST",
      body: JSON.stringify(sweet),
    });
  }

  async updateSweet(id: string, sweet: Partial<{
    name: string;
    description?: string;
    category?: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }>): Promise<Sweet> {
    return this.request<Sweet>(`/api/sweets/${id}`, {
      method: "PUT",
      body: JSON.stringify(sweet),
    });
  }

  async deleteSweet(id: string): Promise<void> {
    return this.request<void>(`/api/sweets/${id}`, {
      method: "DELETE",
    });
  }

  async purchaseSweet(id: string, amount: number = 1): Promise<Sweet> {
    return this.request<Sweet>(`/api/sweets/${id}/purchase`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  }

  async restockSweet(id: string, amount: number): Promise<Sweet> {
    return this.request<Sweet>(`/api/sweets/${id}/restock`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  }
}

export const apiClient = new ApiClient();

