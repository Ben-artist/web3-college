import React, { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { useToast } from '../hooks/use-toast'
import { useWriteContract, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'

// 格式化TSK余额显示
const formatTSKBalance = (balance: bigint | undefined): string => {
  if (!balance) return '0 TSK'
  
  const balanceNumber = Number(formatEther(balance))
  
  if (balanceNumber >= 1000000) {
    return `${(balanceNumber / 1000000).toFixed(2)}M TSK`
  } else if (balanceNumber >= 1000) {
    return `${(balanceNumber / 1000).toFixed(2)}K TSK`
  } else if (balanceNumber >= 1) {
    return `${balanceNumber.toFixed(2)} TSK`
  } else {
    return `${balanceNumber.toFixed(6)} TSK`
  }
}
import { Coins, ArrowUpDown, Loader2, Info, TrendingUp, TrendingDown } from 'lucide-react'
import TOKEN_EXCHANGE_ABI_DATA from '../assets/abis/TokenExchange.json'
import TSK_TOKEN_ABI_DATA from '../assets/abis/TSKToken.json'
import { API_CONFIG } from '../services/api'

// TokenExchange合约ABI
const TOKEN_EXCHANGE_ABI = TOKEN_EXCHANGE_ABI_DATA.abi

// TSK代币合约ABI
const TSK_TOKEN_ABI = TSK_TOKEN_ABI_DATA.abi

// 合约地址 - 从API配置中获取
const TOKEN_EXCHANGE_ADDRESS = API_CONFIG.TOKEN_EXCHANGE_ADDRESS

// TSK代币合约地址 - 用于注入流动性
const TSK_TOKEN_ADDRESS = API_CONFIG.TSK_TOKEN_ADDRESS

interface TokenExchangeProps {
  className?: string
}

const TokenExchange: React.FC<TokenExchangeProps> = ({ className = '' }) => {
  const { walletState } = useWallet()
  const { toast } = useToast()
  
  // 状态管理
  const [ethAmount, setEthAmount] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')
  const [exchangeMode, setExchangeMode] = useState<'buy' | 'sell'>('buy')
  
  // Wagmi合约调用hooks
  const { writeContract: writeBuyContract, isPending: isBuying, data: buyData, error: buyError } = useWriteContract()
  const { writeContract: writeSellContract, isPending: isSelling, data: sellData, error: sellError } = useWriteContract()
  
  // 读取合约信息

  
  // 读取用户代币余额
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: TSK_TOKEN_ADDRESS as `0x${string}`,
    abi: TSK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [walletState.address as `0x${string}`],
    query: {
      enabled: !!walletState.address,
    },
  })

  // 读取TokenExchange合约的TSK代币余额（流动性检查）
  const { data: exchangeTokenBalance, refetch: refetchExchangeBalance } = useReadContract({
    address: TSK_TOKEN_ADDRESS as `0x${string}`,
    abi: TSK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [TOKEN_EXCHANGE_ADDRESS as `0x${string}`],
    query: {
      enabled: true,
    },
  })


  
  // 监听购买结果
  useEffect(() => {
    if (buyData) {
      toast({
        title: "购买成功",
        description: "ETH已成功兑换为代币！",
      })
      // 刷新余额
      refetchTokenBalance()
      refetchExchangeBalance()
      // 清空输入
      setEthAmount('')
      setTokenAmount('')
    }
  }, [buyData, refetchTokenBalance, refetchExchangeBalance, toast])
  
  // 监听购买错误
  useEffect(() => {
    if (buyError) {
      toast({
        title: "购买失败",
        description: `购买失败: ${buyError.message}`,
        variant: "destructive",
      })
    }
  }, [buyError, toast])
  
  // 监听卖出结果
  useEffect(() => {
    if (sellData) {
      toast({
        title: "卖出成功",
        description: "代币已成功兑换为ETH！",
      })
      // 刷新余额
      refetchTokenBalance()
      // 清空输入
      setEthAmount('')
      setTokenAmount('')
    }
  }, [sellData, refetchTokenBalance, toast])
  
  // 监听卖出错误
  useEffect(() => {
    if (sellError) {
      toast({
        title: "卖出失败",
        description: `卖出失败: ${sellError.message}`,
        variant: "destructive",
      })
    }
  }, [sellError, toast])


  
  // 计算兑换数量 - 硬编码兑换比例为1000
  useEffect(() => {
    if (ethAmount && parseFloat(ethAmount) > 0) {
      const rate = 1000 // 硬编码：1 ETH = 1000 TSK
      const calculatedTokenAmount = parseFloat(ethAmount) * rate
      setTokenAmount(calculatedTokenAmount.toFixed(6))
    } else {
      setTokenAmount('')
    }
  }, [ethAmount])

  // 计算卖出代币时的ETH数量 - 硬编码兑换比例为1000
  useEffect(() => {
    if (tokenAmount && parseFloat(tokenAmount) > 0) {
      const rate = 1000 // 硬编码：1 ETH = 1000 TSK
      const calculatedEthAmount = parseFloat(tokenAmount) / rate
      setEthAmount(calculatedEthAmount.toFixed(6))
    } else {
      setEthAmount('')
    }
  }, [tokenAmount])
  
  // 处理ETH购买代币
  const handleBuyTokens = async () => {
    if (!walletState.isConnected) {
      toast({
        title: "提示",
        description: "请先连接钱包",
        variant: "destructive",
      })
      return
    }
    
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      toast({
        title: "提示",
        description: "请输入有效的ETH数量",
        variant: "destructive",
      })
      return
    }

    try {
      const ethAmountWei = parseEther(ethAmount)
      
      // 检查合约流动性
      if (exchangeTokenBalance) {
        const requiredTokens = parseFloat(ethAmount) * 1000 // 1 ETH = 1000 TSK
        const contractBalance = Number(formatEther(exchangeTokenBalance as bigint))
        
        if (contractBalance < requiredTokens) {
          toast({
            title: "⚠️ 流动性不足",
            description: `合约TSK余额: ${contractBalance.toFixed(2)} TSK，需要: ${requiredTokens.toFixed(2)} TSK`,
            variant: "destructive",
          })
          return
        }
      }
      
      // 使用TokenExchange合约的buyToken方法，它是payable的，不需要参数
      writeBuyContract({
        address: TOKEN_EXCHANGE_ADDRESS as `0x${string}`,
        abi: TOKEN_EXCHANGE_ABI,
        functionName: 'buyToken',
        args: [], // buyToken函数不需要参数
        value: ethAmountWei, // 发送ETH到合约
      })
      
      toast({
        title: "交易中",
        description: `正在用 ${ethAmount} ETH 购买TSK代币...`,
      })
      
    } catch (error) {
      console.error('购买代币失败:', error)
      toast({
        title: "错误",
        description: `购买失败: ${error instanceof Error ? error.message : '未知错误'}`,
        variant: "destructive",
      })
    }
  }
  


  // 处理代币卖出ETH
  const handleSellTokens = async () => {
    if (!walletState.isConnected) {
      toast({
        title: "提示",
        description: "请先连接钱包",
        variant: "destructive",
      })
      return
    }
    
    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      toast({
        title: "提示",
        description: "请输入有效的代币数量",
        variant: "destructive",
      })
      return
    }
    
    try {
      const tokenAmountWei = parseEther(tokenAmount)
      
      // 调用TokenExchange合约的sellToken方法
      writeSellContract({
        address: TOKEN_EXCHANGE_ADDRESS as `0x${string}`,
        abi: TOKEN_EXCHANGE_ABI,
        functionName: 'sellToken',
        args: [tokenAmountWei],
      })
      
      toast({
        title: "交易中",
        description: `正在卖出 ${tokenAmount} 代币...`,
      })
      
    } catch (error) {
      console.error('卖出代币失败:', error)
      toast({
        title: "错误",
        description: `卖出失败: ${error instanceof Error ? error.message : '未知错误'}`,
        variant: "destructive",
      })
    }
  }
  
  // 切换兑换模式
  const toggleExchangeMode = () => {
    setExchangeMode(prev => prev === 'buy' ? 'sell' : 'buy')
    setEthAmount('')
    setTokenAmount('')
  }
  
  // 获取当前汇率显示 - 硬编码显示1:1000
  const getExchangeRateDisplay = () => {
    return '1 ETH = 1000 TSK'
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Coins className="h-5 w-5" />
          <span>代币兑换</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* 兑换模式切换 */}
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant={exchangeMode === 'buy' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setExchangeMode('buy')}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>ETH → 代币</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExchangeMode}
            className="p-2"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          
          <Button
            variant={exchangeMode === 'sell' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setExchangeMode('sell')}
            className="flex items-center space-x-2"
          >
            <TrendingDown className="h-4 w-4" />
            <span>代币 → ETH</span>
          </Button>
        </div>
        
        {/* 汇率信息 */}
        <div className="text-center">
          <Badge variant="secondary" className="text-sm">
            {getExchangeRateDisplay()}
          </Badge>
        </div>
        
        {/* 输入区域 */}
        {exchangeMode === 'buy' ? (
          // ETH购买代币模式
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">ETH数量</label>
              <Input
                type="number"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="输入要兑换的ETH数量"
                step="0.001"
                min="0"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">预计获得代币</label>
              <Input
                type="text"
                value={tokenAmount}
                placeholder="自动计算"
                readOnly
                className="bg-muted"
              />
            </div>
            
            <Button
              onClick={handleBuyTokens}
              disabled={!walletState.isConnected || isBuying || !ethAmount || parseFloat(ethAmount) <= 0}
              className="w-full"
            >
              {isBuying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  购买中...
                </>
              ) : (
                '确认购买'
              )}
            </Button>
          </div>
        ) : (
          // 代币卖出ETH模式
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">代币数量</label>
              <Input
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="输入要卖出的代币数量"
                step="0.001"
                min="0"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">预计获得ETH</label>
              <Input
                type="text"
                value={ethAmount}
                placeholder="自动计算"
                readOnly
                className="bg-muted"
              />
            </div>
            
            <Button
              onClick={handleSellTokens}
              disabled={!walletState.isConnected || isSelling || !tokenAmount || parseFloat(tokenAmount) <= 0}
              className="w-full"
            >
              {isSelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  卖出中...
                </>
              ) : (
                '确认卖出'
              )}
            </Button>
          </div>
        )}
        
        {/* 余额信息 */}
        {walletState.isConnected && (
          <div className="space-y-1 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">代币余额:</span>
              <span className="font-medium">
                {tokenBalance ? formatTSKBalance(tokenBalance as bigint) : '0 TSK'}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ETH余额:</span>
              <span className="font-medium">
                {walletState.balance || '0'} ETH
              </span>
            </div>
            

          </div>
        )}
        


        {/* 提示信息 */}
        {!walletState.isConnected && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              请先连接钱包以使用兑换功能
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default TokenExchange
