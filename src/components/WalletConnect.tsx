import React, { useState } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Alert,
} from '@mui/material'
import {
  AccountBalanceWallet as WalletIcon,
  Smartphone as MobileIcon,
  Computer as DesktopIcon,
  Link as LinkIcon,
} from '@mui/icons-material'
import { useConnect, useDisconnect } from 'wagmi'
import { useWallet } from '../hooks/useWallet'

interface WalletConnectProps {
  variant?: 'text' | 'outlined' | 'contained'
  size?: 'small' | 'medium' | 'large'
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  variant = 'outlined',
  size = 'medium',
}) => {
  const { walletState, disconnectWallet } = useWallet()
  const { connect, connectors, error, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  
  const [showDialog, setShowDialog] = useState(false)

  // 处理钱包连接
  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector })
      setShowDialog(false)
    } catch (error) {
      console.error('连接钱包失败:', error)
    }
  }

  // 处理断开连接
  const handleDisconnect = async () => {
    try {
      await disconnect()
      disconnectWallet()
    } catch (error) {
      console.error('断开连接失败:', error)
    }
  }

  // 获取钱包图标
  const getWalletIcon = (connector: any) => {
    const name = connector.name.toLowerCase()
    if (name.includes('metamask')) return <WalletIcon />
    if (name.includes('walletconnect')) return <LinkIcon />
    if (name.includes('mobile')) return <MobileIcon />
    return <DesktopIcon />
  }

  // 获取钱包名称
  const getWalletName = (connector: any) => {
    const name = connector.name
    if (name.includes('MetaMask')) return 'MetaMask'
    if (name.includes('WalletConnect')) return 'WalletConnect'
    if (name.includes('Injected')) return '浏览器钱包'
    return name
  }

  // 如果已连接，显示断开连接按钮
  if (walletState.isConnected) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleDisconnect}
        color="inherit"
      >
        断开连接
      </Button>
    )
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowDialog(true)}
        color="inherit"
      >
        连接钱包
      </Button>

      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WalletIcon />
            <Typography variant="h6">选择钱包</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message}
            </Alert>
          )}
          
          <List>
            {connectors.map((connector) => (
              <ListItem key={connector.uid} disablePadding>
                <ListItemButton
                  onClick={() => handleConnect(connector)}
                  disabled={!connector.ready || isPending}
                >
                  <ListItemIcon>
                    {getWalletIcon(connector)}
                  </ListItemIcon>
                  <ListItemText
                    primary={getWalletName(connector)}
                    secondary={
                      !connector.ready
                        ? '不可用'
                        : isPending
                        ? '连接中...'
                        : '点击连接'
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            推荐使用 MetaMask 钱包以获得最佳体验
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>
            取消
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default WalletConnect
