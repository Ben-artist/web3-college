import { http, createConfig } from 'wagmi'
import { sepolia, localhost } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

// 配置支持的区块链网络
export const config = createConfig({
  chains: [sepolia, localhost],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [sepolia.id]: http(),
    [localhost.id]: http('http://localhost:7545'),
  },
})

// 网络配置（简化版）
export const networks = {
  sepolia: {
    id: sepolia.id,
    name: 'Sepolia测试网',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/your-api-key',
    explorer: 'https://sepolia.etherscan.io',
    currency: 'ETH',
  },
  localhost: {
    id: localhost.id,
    name: '本地网络',
    rpcUrl: 'http://localhost:7545',
    explorer: 'http://localhost:7545',
    currency: 'ETH',
  },
}
