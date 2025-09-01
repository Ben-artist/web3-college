import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { useWallet } from '../hooks/useWallet'

interface NetworkSelectorProps {
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  size = 'md',
  showLabel = true,
}) => {
  const { currentNetwork, availableNetworks, switchNetwork } = useWallet()

  // 处理网络切换
  const handleNetworkChange = (chainId: string) => {
    switchNetwork(parseInt(chainId))
  }

  // 获取网络状态颜色
  const getNetworkStatusColor = (chainId: number) => {
    if (chainId === 1) return 'bg-green-500' // 主网
    if (chainId === 11155111) return 'bg-yellow-500' // 测试网
    return 'bg-blue-500' // 本地网络
  }

  // 获取网络状态文本
  const getNetworkStatusText = (chainId: number) => {
    if (chainId === 1) return '主网'
    if (chainId === 11155111) return '测试网'
    return '本地'
  }

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-[120px]">
        {showLabel && (
          <label className="text-sm font-medium mb-2 block">网络</label>
        )}
        <Select
          value={currentNetwork?.id?.toString() || ''}
          onValueChange={handleNetworkChange}
        >
          <SelectTrigger className={`${size === 'sm' ? 'h-8' : size === 'lg' ? 'h-12' : 'h-10'}`}>
            <SelectValue placeholder="选择网络" />
          </SelectTrigger>
          <SelectContent>
            {availableNetworks.map((network) => (
              <SelectItem key={network.id} value={network.id.toString()}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {network.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getNetworkStatusColor(network.id)} text-white border-0`}
                  >
                    {getNetworkStatusText(network.id)}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 当前网络状态显示 */}
      {currentNetwork && (
        <div className="flex items-center gap-2">
          <Badge
            variant="default"
            className={`text-xs ${getNetworkStatusColor(currentNetwork.id)}`}
          >
            {currentNetwork.name}
          </Badge>
          <span className="text-xs text-gray-500">
            {currentNetwork.currency}
          </span>
        </div>
      )}
    </div>
  )
}

export default NetworkSelector
