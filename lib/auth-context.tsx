'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, User } from './api'
import { sendEmail } from './send-email'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (data: { username: string; email: string; password: string; password2: string; first_name?: string; last_name?: string }) => Promise<void>
  updateProfile: (data: { first_name?: string; last_name?: string; phone?: string; address?: string }) => Promise<User>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const token = api.getToken()
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const userData = await api.getProfile()
      setUser(userData)
    } catch (error) {
      // Token might be invalid, clear it
      api.clearToken()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password })
    api.setToken(data.token)
    setUser(data.user)
    // Send login notification to user
    await sendEmail({
      to: data.user.email,
      subject: 'Login Notification',
      message: `Hi ${data.user.first_name || data.user.username},\n\nYou have successfully logged in to Meher Foods. If this wasn't you, please contact support.`,
    })
    // Send notification to shopkeeper
    await sendEmail({
      to: 'shopkeeper@meherfoods.com', // Change to actual shopkeeper email
      subject: 'User Login',
      message: `User logged in:\n\nUsername: ${data.user.username}\nEmail: ${data.user.email}`,
    })
  }

  const logout = () => {
    api.clearToken()
    setUser(null)
  }

  const register = async (data: { username: string; email: string; password: string; password2: string; first_name?: string; last_name?: string }) => {
    const result = await api.register(data)
    api.setToken(result.token)
    setUser(result.user)
    // Send confirmation email to user
    await sendEmail({
      to: data.email,
      subject: 'Welcome to Meher Foods',
      message: `Hi ${data.first_name || data.username},\n\nYour account has been created successfully at Meher Foods!\n\nThank you for registering.`,
    })
    // Send notification to shopkeeper
    await sendEmail({
      to: 'shopkeeper@meherfoods.com', // Change to actual shopkeeper email
      subject: 'New User Registration',
      message: `A new user has registered:\n\nUsername: ${data.username}\nEmail: ${data.email}\nName: ${data.first_name || ''} ${data.last_name || ''}`,
    })
  }

  const updateProfile = async (data: { first_name?: string; last_name?: string; phone?: string; address?: string }) => {
    const updatedUser = await api.updateProfile(data)
    setUser(updatedUser)
    return updatedUser
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
