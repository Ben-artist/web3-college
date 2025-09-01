import React, { useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Alert, AlertDescription } from './ui/alert'
import { Wallet, Smartphone, Monitor, Link as LinkIcon } from 'lucide-react'
import { useConnect } from 'wagmi'
import { useWallet } from '../hooks/useWallet'

interface WalletConnectProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  variant = 'outline',
  size = 'default',
}) => {
  const { walletState, disconnectWallet } = useWallet()
  const { connect, connectors, error, isPending } = useConnect()
  
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
      await disconnectWallet() // 使用统一的断开连接函数
    } catch (error) {
      console.error('断开连接失败:', error)
    }
  }

  // 获取钱包图标
  const getWalletIcon = (connector: any) => {
    const name = connector.name.toLowerCase()
    if (name.includes('metamask')) return <Wallet className="h-4 w-4" />
    if (name.includes('walletconnect')) return <LinkIcon className="h-4 w-4" />
    if (name.includes('mobile')) return <Smartphone className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
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
        className="text-inherit"
      >
        断开连接
      </Button>
    )
  }

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className="text-inherit"
          >
            连接钱包
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>选择钱包</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {connectors.map((connector) => (
              <div
                key={connector.uid}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleConnect(connector)}
              >
                <div className="flex items-center space-x-3">
                  {getWalletIcon(connector)}
                  <span className="font-medium">{getWalletName(connector)}</span>
                </div>
                {connector.ready ? (
                  <span className="text-xs text-green-600">可用</span>
                ) : null}
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                连接失败: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {isPending && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">正在连接...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default WalletConnect
