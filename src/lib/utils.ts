import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化以太坊地址
export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 格式化ETH余额
export function formatETHBalance(balance: string | number): string {
  try {
    const num = typeof balance === 'string' ? parseFloat(balance) : balance
    return num.toFixed(4)
  } catch (error) {
    return '0'
  }
}

// 格式化时间戳
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}

// 获取网络状态颜色
export function getNetworkStatusColor(chainId: number): string {
  if (chainId === 1) return 'bg-green-500' // 主网
  if (chainId === 11155111) return 'bg-yellow-500' // 测试网
  return 'bg-blue-500' // 本地网络
}

// 获取网络状态文本
export function getNetworkStatusText(chainId: number): string {
  if (chainId === 1) return '主网'
  if (chainId === 11155111) return '测试网'
  return '本地'
}
