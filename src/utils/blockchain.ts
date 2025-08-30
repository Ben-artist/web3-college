import { formatEther, parseEther } from 'viem'

// 格式化以太坊地址显示
export const formatAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 格式化ETH余额显示
export const formatETHBalance = (balance: bigint | string): string => {
  try {
    if (typeof balance === 'string') {
      return parseFloat(balance).toFixed(4)
    }
    return formatEther(balance)
  } catch (error) {
    return '0'
  }
}

// 验证以太坊地址格式
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// 计算Gas费用估算
export const estimateGasFee = (gasPrice: bigint, gasLimit: bigint): string => {
  try {
    const fee = gasPrice * gasLimit
    return formatEther(fee)
  } catch (error) {
    return '0'
  }
}

// 网络名称映射
export const getNetworkName = (chainId: number): string => {
  const networks: { [key: number]: string } = {
    1: '以太坊主网',
    11155111: 'Sepolia测试网',
    1337: '本地网络',
    31337: 'Hardhat网络',
  }
  return networks[chainId] || `未知网络 (${chainId})`
}

// 代币价格格式化
export const formatTokenPrice = (price: number, decimals: number = 18): string => {
  return (price / Math.pow(10, decimals)).toFixed(6)
}

// 时间戳格式化
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}
