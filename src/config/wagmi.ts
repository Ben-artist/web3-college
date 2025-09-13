import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";
import { defineChain } from "viem";

// 定义本地链（如果 localhost 不可用）
const localhostChain = defineChain({
	id: 1337,
	name: "Localhost",
	nativeCurrency: {
		decimals: 18,
		name: "Ether",
		symbol: "ETH",
	},
	rpcUrls: {
		default: {
			http: ["http://localhost:7545"],
		},
	},
});

// 配置支持的区块链网络 - 优先使用本地链
export const config = createConfig({
	chains: [localhostChain, sepolia],
	connectors: [injected(), metaMask()],
	transports: {
		[sepolia.id]: http(),
		[localhostChain.id]: http("http://localhost:7545"),
	},
});

// 网络配置（简化版）
export const networks = {
	localhost: {
		id: localhostChain.id,
		name: "本地网络 (Ganache)",
		rpcUrl: "http://127.0.0.1:7545",
		explorer: "http://127.0.0.1:7545",
		currency: "ETH",
	},
	sepolia: {
		id: sepolia.id,
		name: "Sepolia 测试网",
		rpcUrl: "https://sepolia.infura.io/v3/28b48ace2abf40e4ad15359cf9e3a39d",
		explorer: "https://sepolia.etherscan.io",
		currency: "ETH",
	},
};
