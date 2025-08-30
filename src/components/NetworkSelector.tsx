import React from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
} from '@mui/material'
import { useWallet } from '../hooks/useWallet'
import { getNetworkName } from '../utils/blockchain'

interface NetworkSelectorProps {
  size?: 'small' | 'medium'
  showLabel?: boolean
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  size = 'medium',
  showLabel = true,
}) => {
  const { currentNetwork, availableNetworks, switchNetwork } = useWallet()

  // 处理网络切换
  const handleNetworkChange = (event: any) => {
    const chainId = parseInt(event.target.value)
    switchNetwork(chainId)
  }

  // 获取网络状态颜色
  const getNetworkStatusColor = (chainId: number) => {
    if (chainId === 1) return 'success' // 主网
    if (chainId === 11155111) return 'warning' // 测试网
    return 'info' // 本地网络
  }

  // 获取网络状态文本
  const getNetworkStatusText = (chainId: number) => {
    if (chainId === 1) return '主网'
    if (chainId === 11155111) return '测试网'
    return '本地'
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <FormControl size={size} sx={{ minWidth: 120 }}>
        {showLabel && (
          <InputLabel id="network-select-label">网络</InputLabel>
        )}
        <Select
          labelId="network-select-label"
          value={currentNetwork?.id || ''}
          label={showLabel ? '网络' : ''}
          onChange={handleNetworkChange}
          displayEmpty
        >
          {availableNetworks.map((network) => (
            <MenuItem key={network.id} value={network.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  {network.name}
                </Typography>
                <Chip
                  label={getNetworkStatusText(network.id)}
                  size="small"
                  color={getNetworkStatusColor(network.id)}
                  variant="outlined"
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 当前网络状态显示 */}
      {currentNetwork && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={currentNetwork.name}
            size="small"
            color={getNetworkStatusColor(currentNetwork.id)}
            variant="filled"
          />
          <Typography variant="caption" color="text.secondary">
            {currentNetwork.currency}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default NetworkSelector
