export interface MenuItem {
  id: string
  name: string
  shortName: string
  description: string
  price: number
  image: string
  category: string
  rating: number
  prepTime: string
  isPopular: boolean
  isFree: boolean
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  tableNumber: string
  items: OrderItem[]
  totalAmount: number
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  notes?: string
  orderTime: string
  completedAt?: string
}

export interface OrderItem {
  id: string
  menuItemId: string
  menuItem: MenuItem
  quantity: number
  unitPrice: number
  subtotal: number
  specialRequests?: string
}

export interface Table {
  id: string
  tableNumber: string
  qrCodeUrl: string
  status: "available" | "occupied" | "reserved"
  capacity: number
}

export interface User {
  id: string
  fullName: string
  username: string
  role: "admin" | "staff" | "kitchen"
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description: string
  displayOrder: number
  isActive: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
