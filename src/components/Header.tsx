import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Wallet, Network, BookOpen, User } from 'lucide-react'

const Header: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { walletState, currentNetwork, connectWallet, connectors, availableNetworks, switchNetwork } = useWallet()
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  // 处理钱包菜单
  const handleWalletMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // 连接钱包
  const handleConnectWallet = async (connector: any) => {
    try {
      await connectWallet(connector)
      handleClose()
    } catch (error) {
      console.error('连接钱包失败:', error)
    }
  }

  // 断开钱包连接
  const handleDisconnect = () => {
    // 这里可以添加断开钱包的逻辑
    handleClose()
  }



  // 切换网络
  const handleNetworkChange = async (chainId: number) => {
    try {
      await switchNetwork(chainId)
    } catch (error) {
      console.error('切换网络失败:', error)
    }
  }

  // 格式化地址显示
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* 应用标题 */}
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Web3大学</h1>
        </div>

        {/* 导航按钮 */}
        <nav className="flex items-center space-x-4 ml-8">
          <Button
            variant={location.pathname === '/student' ? 'default' : 'ghost'}
            onClick={() => navigate('/student')}
            className="flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>学生端</span>
          </Button>
          <Button
            variant={location.pathname === '/author' ? 'default' : 'ghost'}
            onClick={() => navigate('/author')}
            className="flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>作者端</span>
          </Button>
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {/* 网络选择器 */}
          <div className="flex items-center space-x-2">
            <Network className="h-4 w-4 text-muted-foreground" />
            <Select value={currentNetwork?.id?.toString() || ''} onValueChange={(value) => handleNetworkChange(parseInt(value))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="选择网络" />
              </SelectTrigger>
              <SelectContent>
                {availableNetworks.map((network) => (
                  <SelectItem key={network.id} value={network.id.toString()}>
                    {network.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 钱包信息 */}
          {walletState.isConnected ? (
            <div className="flex items-center space-x-3">
              {/* 余额显示 */}
              <Badge variant="outline" className="px-3 py-1">
                {walletState.balance || '0'} ETH
              </Badge>
              
              {/* 钱包地址 */}
              <Button
                variant="ghost"
                onClick={handleWalletMenu}
                className="flex items-center space-x-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {walletState.address?.slice(2, 4)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">
                  {walletState.ensName || formatAddress(walletState.address || '')}
                </span>
              </Button>

              {/* 钱包菜单 */}
              {anchorEl && (
                <div className="absolute top-16 right-4 bg-popover border rounded-md shadow-lg p-2">
                  <Button
                    variant="ghost"
                    onClick={handleDisconnect}
                    className="w-full justify-start"
                  >
                    断开连接
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => handleConnectWallet(connectors[0])}
              className="flex items-center space-x-2"
            >
              <Wallet className="h-4 w-4" />
              <span>连接钱包</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
