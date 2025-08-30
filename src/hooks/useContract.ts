import { useState, useCallback } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { 
  COURSE_MANAGEMENT_ABI, 
  YD_TOKEN_ABI, 
  getContractAddress 
} from '../contracts/abi'
import { Course } from '../types'

// 合约交互Hook
export const useContract = () => {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 创建课程
  const createCourse = useCallback(async (
    title: string, 
    content: string, 
    price: number,
    chainId: number
  ): Promise<string | null> => {
    if (!address || !walletClient) {
      setError('钱包未连接')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const contractAddress = getContractAddress(chainId, 'courseManagement')
      
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: COURSE_MANAGEMENT_ABI,
        functionName: 'createCourse',
        args: [title, content, parseEther(price.toString())],
      })

      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
      if (receipt.status === 'success') {
        return hash
      } else {
        setError('交易失败')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建课程失败'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, walletClient, publicClient])

  // 购买课程
  const purchaseCourse = useCallback(async (
    courseId: string,
    price: number,
    chainId: number
  ): Promise<string | null> => {
    if (!address || !walletClient) {
      setError('钱包未连接')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const contractAddress = getContractAddress(chainId, 'courseManagement')
      
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: COURSE_MANAGEMENT_ABI,
        functionName: 'purchaseCourse',
        args: [parseInt(courseId)],
        value: parseEther(price.toString()),
      })

      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
      if (receipt.status === 'success') {
        return hash
      } else {
        setError('交易失败')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '购买课程失败'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, walletClient, publicClient])

  // 获取课程信息
  const getCourse = useCallback(async (
    courseId: string,
    chainId: number
  ): Promise<Course | null> => {
    if (!publicClient) {
      setError('客户端未初始化')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const contractAddress = getContractAddress(chainId, 'courseManagement')
      
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: COURSE_MANAGEMENT_ABI,
        functionName: 'getCourse',
        args: [parseInt(courseId)],
      })

      if (result && result.exists) {
        return {
          id: courseId,
          title: result.title,
          content: result.content,
          price: parseFloat(formatEther(result.price)),
          author: result.author,
          authorAddress: result.author,
          isPurchased: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
      }
      
      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取课程信息失败'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [publicClient])

  // 检查用户是否已购买课程
  const hasUserPurchasedCourse = useCallback(async (
    courseId: string,
    chainId: number
  ): Promise<boolean> => {
    if (!address || !publicClient) {
      return false
    }

    try {
      const contractAddress = getContractAddress(chainId, 'courseManagement')
      
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: COURSE_MANAGEMENT_ABI,
        functionName: 'hasUserPurchasedCourse',
        args: [address, parseInt(courseId)],
      })

      return result as boolean
    } catch (err) {
      console.error('检查购买状态失败:', err)
      return false
    }
  }, [address, publicClient])

  // 兑换ETH为YD代币
  const exchangeETHForYD = useCallback(async (
    ethAmount: number,
    chainId: number
  ): Promise<string | null> => {
    if (!address || !walletClient) {
      setError('钱包未连接')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const contractAddress = getContractAddress(chainId, 'ydToken')
      
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: YD_TOKEN_ABI,
        functionName: 'exchangeETHForYD',
        args: [parseEther(ethAmount.toString())],
        value: parseEther(ethAmount.toString()),
      })

      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
      if (receipt.status === 'success') {
        return hash
      } else {
        setError('交易失败')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '代币兑换失败'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, walletClient, publicClient])

  // 获取YD代币余额
  const getYDBalance = useCallback(async (
    chainId: number
  ): Promise<string> => {
    if (!address || !publicClient) {
      return '0'
    }

    try {
      const contractAddress = getContractAddress(chainId, 'ydToken')
      
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: YD_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [address],
      })

      return formatEther(result as bigint)
    } catch (err) {
      console.error('获取YD余额失败:', err)
      return '0'
    }
  }, [address, publicClient])

  return {
    isLoading,
    error,
    createCourse,
    purchaseCourse,
    getCourse,
    hasUserPurchasedCourse,
    exchangeETHForYD,
    getYDBalance,
  }
}
