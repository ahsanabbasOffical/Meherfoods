const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sub.meherfoods.com/api'

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: string
  images: {
    id: number
    image_url: string
    alt_text: string
  }[]
  category: number
  category_name: string
  in_stock: boolean
  is_featured: boolean
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  profile?: {
    phone: string
    address: string
  }
}

export interface CartItem {
  id: number
  product: Product
  quantity: number
  subtotal: number
}

export interface Cart {
  id: number
  items: CartItem[]
  total: number
}

export interface Delivery {
  id: number
  order_name: string
  product: number
  product_name: string
  quantity: number
  total_price: string
  address_snapshot: string
  status: string
  created_at: string
}

export interface Invoice {
  id: number
  invoice_number: string
  deliveries: Delivery[]
  total_amount: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  status: string
  created_at: string
}

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  getToken(): string | null {
    if (this.token) return this.token
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    const token = this.getToken()
    if (token) {
      headers.Authorization = `Token ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // Auth
  async register(data: { username: string; email: string; password: string; password2: string; first_name?: string; last_name?: string }) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: { username?: string; email?: string; password: string }) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getProfile() {
    return this.request('/auth/profile/')
  }

  async updateProfile(data: { first_name?: string; last_name?: string; phone?: string; address?: string }) {
    return this.request('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Products
  async getProducts(params?: { category?: string; min_price?: number; max_price?: number; search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.min_price) searchParams.set('min_price', params.min_price.toString())
    if (params?.max_price) searchParams.set('max_price', params.max_price.toString())
    if (params?.search) searchParams.set('search', params.search)

    const query = searchParams.toString()
    return this.request(`/products/${query ? `?${query}` : ''}`)
  }

  async getProduct(slug: string) {
    return this.request(`/products/${slug}/`)
  }

  async getRelatedProducts(slug: string) {
    return this.request(`/products/${slug}/related/`)
  }

  // Categories
  async getCategories() {
    return this.request('/categories/')
  }

  // Home data
  async getHomeData() {
    return this.request('/')
  }

  // Cart
  async getCart() {
    return this.request('/cart/')
  }

  async addToCart(productId: number, quantity: number = 1) {
    return this.request('/cart/add_item/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    })
  }

  async updateCartItem(itemId: number, quantity: number) {
    return this.request('/cart/update_item/', {
      method: 'PATCH',
      body: JSON.stringify({ item_id: itemId, quantity }),
    })
  }

  async removeCartItem(itemId: number) {
    return this.request('/cart/remove_item/', {
      method: 'DELETE',
      body: JSON.stringify({ item_id: itemId }),
    })
  }

  async clearCart() {
    return this.request('/cart/clear_cart/', {
      method: 'DELETE',
    })
  }

  async checkout() {
    return this.request('/cart/checkout/', {
      method: 'POST',
    })
  }

  // Wishlist
  async getWishlist() {
    return this.request('/wishlist/')
  }

  async toggleWishlist(productId: number) {
    return this.request('/wishlist/toggle/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    })
  }

  // Contact
  async sendContact(data: { name: string; email: string; subject: string; message: string }) {
    return this.request('/contact/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Orders
  async getPendingOrdersCount() {
    return this.request('/pending-orders-count/')
  }

  async getOrders() {
    return this.request('/invoices/')
  }

  async getUserDeliveries() {
    return this.request('/user-deliveries/')
  }
}

export const api = new ApiClient()
