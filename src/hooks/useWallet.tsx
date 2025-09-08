import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useBalance, useConnect, useDisconnect, useSignMessage, type Connector } from 'wagmi'
import { formatEther } from 'viem'
import { WalletState, UsernameVerificationResponse } from '../types'
import { FETCH_URL } from '@/lib/constant'

// 钱包上下文
interface WalletContextType {
  walletState: WalletState
  connectWallet: (connector: Connector) => Promise<void>
  disconnectWallet: () => Promise<void>
  updateUsername: (username: string) => void
  updateUsernameWithSignature: (username: string) => Promise<UsernameVerificationResponse>
  refreshBalance: () => void
  connectors: readonly Connector[]
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// 钱包提供者组件
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
  })

  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
  })

  // 连接钱包
  const connectWallet = async (connector: any) => {
    try {
      connect({ connector })
    } catch (error) {
      console.error('连接钱包失败:', error)
    }
  }

  // 断开钱包连接
  const disconnectWallet = async () => {
    try {
      disconnect()
      setWalletState({
        isConnected: false,
      })
    } catch (error) {
      console.error('断开钱包连接失败:', error)
      setWalletState({
        isConnected: false,
      })
    }
  }

  // 更新用户名
  const updateUsername = (username: string) => {
    if (walletState.isConnected) {
      setWalletState(prev => ({
        ...prev,
        username: username.trim()
      }))
      // 保存到localStorage
      localStorage.setItem(`username_${walletState.address}`, username.trim())
    }
  }

  // 使用签名验证用户名
  const updateUsernameWithSignature = async (username: string): Promise<UsernameVerificationResponse> => {
    if (!walletState.isConnected || !address) {
      return {
        success: false,
        message: '钱包未连接'
      }
    }

    try {
      // 创建要签名的消息
      const message = `Web3大学用户名验证\n地址: ${address}\n用户名: ${username}\n时间戳: ${Date.now()}`

      // 请求用户签名
      const signature = await signMessageAsync({
        message: message
      })

      // 发送到后端验证
      const response = await fetch(`${FETCH_URL}/api/updateUsername`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          message,
          signature,
          newName: username.trim()
        })
      })

      const result: UsernameVerificationResponse = await response.json()

      if (result.success) {
        // 验证成功，更新本地状态
        setWalletState(prev => ({
          ...prev,
          username: username.trim(),
          isUsernameVerified: true
        }))
        // 保存到localStorage
        localStorage.setItem(`username_${address}`, username.trim())
        localStorage.setItem(`username_verified_${address}`, 'true')
      }

      return result
    } catch (error) {
      console.error('签名验证失败:', error)
      return {
        success: false,
        message: '签名验证失败，请重试'
      }
    }
  }

  // 监听钱包状态变化
  useEffect(() => {
    if (isConnected && address && chainId) {
      // 从localStorage加载用户名和验证状态
      const savedUsername = localStorage.getItem(`username_${address}`)

      // 如果没有保存的用户名，使用地址作为默认用户名
      const defaultUsername = savedUsername || address

      setWalletState({
        isConnected: true,
        address,
        chainId,
        balance: formatEther(balanceData?.value || BigInt(0)),
        tokenSymbol: balanceData?.symbol || 'ETH',
        username: defaultUsername,
      })
    } else {
      setWalletState({
        isConnected: false,
      })
    }
  }, [isConnected, address, chainId, balanceData])

  // 刷新余额
  const refreshBalance = () => {
    refetchBalance()
  }

  const value: WalletContextType = {
    walletState,
    connectWallet,
    disconnectWallet,
    updateUsername,
    updateUsernameWithSignature,
    refreshBalance,
    connectors,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

// 使用钱包Hook
export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}