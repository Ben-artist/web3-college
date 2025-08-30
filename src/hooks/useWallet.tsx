import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useBalance, useWriteContract, useConnect, useDisconnect, type Connector } from 'wagmi'
import { WalletState, Network } from '../types'
import { networks } from '../config/wagmi'

// 钱包上下文
interface WalletContextType {
  walletState: WalletState
  connectWallet: (connector: Connector) => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
  currentNetwork: Network | null
  availableNetworks: Network[]
  connectors: readonly Connector[]
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// 钱包提供者组件
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
  })

  const { address, isConnected, chainId } = useAccount()
  const { writeContract } = useWriteContract()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balanceData } = useBalance({
    address,
  })

  // 获取可用网络列表
  const availableNetworks = Object.values(networks)
  
  // 获取当前网络信息
  const currentNetwork = availableNetworks.find(network => network.id === chainId) || null

  // 连接钱包
  const connectWallet = async (connector: any) => {
    try {
      await connect({ connector })
    } catch (error) {
      console.error('连接钱包失败:', error)
    }
  }

  // 断开钱包连接
  const disconnectWallet = () => {
    disconnect()
    setWalletState({
      isConnected: false,
    })
  }

  // 切换网络
  const handleSwitchNetwork = async (chainId: number) => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // 尝试切换网络
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        })
        
        // 等待一下让钱包完成切换
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 触发Wagmi重新检测网络
        window.ethereum.request({ method: 'eth_chainId' })
      }
    } catch (error) {
      console.error('切换网络失败:', error)
    }
  }

  // 监听钱包状态变化
  useEffect(() => {
    if (isConnected && address && chainId) {
      setWalletState({
        isConnected: true,
        address,
        chainId,
        balance: balanceData?.formatted || '0',
      })
    } else {
      setWalletState({
        isConnected: false,
      })
    }
  }, [isConnected, address, chainId, balanceData])

  // 监听网络变化
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        console.log('网络已切换:', chainId)
        // Wagmi会自动处理网络变化，这里只是记录
      }

      const handleAccountsChanged = (accounts: string[]) => {
        console.log('账户已切换:', accounts)
        // Wagmi会自动处理账户变化，这里只是记录
      }

      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged)
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  const value: WalletContextType = {
    walletState,
    connectWallet,
    disconnectWallet,
    switchNetwork: handleSwitchNetwork,
    currentNetwork,
    availableNetworks,
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
