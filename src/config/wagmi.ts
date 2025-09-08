import { http, createConfig } from 'wagmi'
import { localhost, sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'
// 配置支持的区块链网络 - 优先使用本地链
export const config = createConfig({
  chains: [localhost,sepolia],
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
  localhost: {
    id: localhost.id,
    name: '本地网络 (Ganache)',
    rpcUrl: 'http://127.0.0.1:7545',
    explorer: 'http://127.0.0.1:7545',
    currency: 'ETH',
  },
  sepolia: {
    id: sepolia.id,
    name: 'Sepolia 测试网',
    rpcUrl: 'https://sepolia.infura.io/v3/28b48ace2abf40e4ad15359cf9e3a39d',
    explorer: 'https://sepolia.etherscan.io',
    currency: 'ETH',
  },
}
