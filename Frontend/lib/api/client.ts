const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export interface User {
  id: string;
  email: string;
  displayName?: string;
  deliveryAddress?: string;
  mobileNumber?: string;
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

export interface OrderItem {
  id: string;
  sweetId: string;
  quantity: number;
  price: number;
  sweet?: Sweet;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentProvider?: string | null;
  paymentReference?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSession {
  provider: string;
  sessionId: string;
  amount: number;
  currency: string;
  status: string;
  message: string;
  gatewayOrderId?: string;
  keyId?: string;
  supportedMethods?: string[];
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  statusCounts: Record<string, number>;
  revenueByDay: Array<{ date: string; revenue: number }>;
  topSweets: Array<{ name: string; quantity: number }>;
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
    const isFormData = options.body instanceof FormData;
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

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
          `Cannot connect to backend server at ${this.baseUrl}. Please make sure the backend is running and reachable.`
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

  async createSweet(sweet: FormData): Promise<Sweet> {
    return this.request<Sweet>("/api/sweets", {
      method: "POST",
      body: sweet,
    });
  }

  async updateSweet(id: string, sweet: FormData): Promise<Sweet> {
    return this.request<Sweet>(`/api/sweets/${id}`, {
      method: "PUT",
      body: sweet,
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

  async getProfile(): Promise<User> {
    return this.request<User>("/api/auth/profile", {
      method: "GET",
    });
  }

  async updateProfile(payload: {
    displayName?: string;
    mobileNumber?: string;
    deliveryAddress?: string;
  }): Promise<User> {
    return this.request<User>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async createPaymentSession(amount: number): Promise<PaymentSession> {
    return this.request<PaymentSession>("/api/orders/payment-session", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  }

  async createOrder(payload: {
    items: Array<{ sweetId: string; quantity: number }>;
    paymentReference?: string;
    paymentProvider?: string;
    paymentMeta?: {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
    };
  }): Promise<Order> {
    return this.request<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>("/api/orders", { method: "GET" });
  }

  async getAllOrders(): Promise<Order[]> {
    return this.request<Order[]>("/api/orders/admin", { method: "GET" });
  }

  async updateOrderStatus(id: string, payload: { status?: string; paymentStatus?: string }): Promise<Order> {
    return this.request<Order>(`/api/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async getOrderAnalytics(): Promise<OrderAnalytics> {
    return this.request<OrderAnalytics>("/api/orders/admin/analytics", { method: "GET" });
  }
}

export const apiClient = new ApiClient();
