// 课程类型定义
export interface Course {
  id: string
  title: string
  content: string
  price: number
  description?: string
  cover?: string
  buyer: string[]
  txHash?: string
  author: string
  authorAddress: string
  isPurchased: boolean
  createdAt: number
  updatedAt: number
}

// 用户类型定义
export interface User {
  address: string
  ensName?: string
  balance: string
  ydBalance: number
  purchasedCourses: string[]
  createdCourses: string[]
}

// 网络类型定义
export interface Network {
  id: number
  name: string
  rpcUrl: string
  explorer: string
  currency: string
}

// 钱包连接状态
export interface WalletState {
  isConnected: boolean
  address?: string
  ensName?: string
  chainId?: number
  balance?: string
}

// 代币兑换类型
export interface TokenExchange {
  fromToken: string
  toToken: string
  amount: number
  rate: number
}

// AI润色请求类型
export interface AIRefineRequest {
  content: string
  style: 'academic' | 'casual' | 'professional'
  language: 'zh' | 'en'
}

// AI润色响应类型
export interface AIRefineResponse {
  refinedContent: string
  suggestions: string[]
  confidence: number
}
