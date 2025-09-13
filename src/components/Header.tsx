import { BookOpen, User, Wallet } from "lucide-react";
import type React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Connector } from "wagmi";
import { useWallet } from "../hooks/useWallet";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const Header: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { walletState, connectWallet, disconnectWallet, connectors } =
		useWallet();

	// 连接钱包
	const handleConnectWallet = async (connector: Connector) => {
		try {
			await connectWallet(connector);
		} catch (error) {
			console.error("连接钱包失败:", error);
		}
	};

	const handleDisconnectWallet = async () => {
		await disconnectWallet();
	};

	// 格式化地址显示
	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center">
				{/* 应用标题 */}
				<button
					type="button"
					className="flex items-center space-x-2 cursor-pointer bg-transparent border-none p-0"
					onClick={() => navigate("/")}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							navigate("/");
						}
					}}
					aria-label="返回首页"
				>
					<BookOpen className="h-6 w-6 text-primary" />
					<h1 className="text-xl font-bold">Web3大学</h1>
				</button>

				{/* 导航按钮 */}
				<nav className="flex items-center space-x-4 ml-8">
					<Button
						variant={
							location.pathname === "/student" || location.pathname === "/"
								? "default"
								: "ghost"
						}
						onClick={() => navigate("/student")}
						className="flex items-center space-x-2"
					>
						<User className="h-4 w-4" />
						<span>学生端</span>
					</Button>
					<Button
						variant={location.pathname === "/author" ? "default" : "ghost"}
						onClick={() => navigate("/author")}
						className="flex items-center space-x-2"
					>
						<User className="h-4 w-4" />
						<span>作者端</span>
					</Button>
				</nav>

				<div className="ml-auto flex items-center space-x-4">
					{/* 钱包信息 */}
					{walletState.isConnected ? (
						<div className="flex items-center space-x-3">
							{/* 余额显示 */}
							<Badge variant="outline" className="px-3 py-1">
								{/* 显示余额和币种，如果walletState中有tokenSymbol则显示，否则默认ETH */}
								{walletState.balance} {walletState.tokenSymbol || "ETH"}
							</Badge>

							{/* 钱包地址 */}
							<Button variant="ghost" className="flex items-center space-x-2">
								<Avatar className="h-6 w-6">
									<AvatarFallback className="text-xs">
										{walletState.address?.slice(2, 4)}
									</AvatarFallback>
								</Avatar>
								<span className="hidden sm:inline">
									{formatAddress(walletState.address || "")}
								</span>
							</Button>

							<Button
								variant="ghost"
								onClick={handleDisconnectWallet}
								className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
							>
								<Wallet className="h-4 w-4" />
								<span>断开连接</span>
							</Button>
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
	);
};

export default Header;
