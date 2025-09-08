import {
	BookOpen,
	Check,
	Coins,
	Info,
	Loader2,
	ShoppingCart,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseEther } from "viem";
import {
	useReadContract,
	useWaitForTransactionReceipt,
	useWriteContract,
} from "wagmi";
import {
	COURSE_MANAGER_ADDRESS,
	EXCHANGE_ADDRESS,
	FETCH_URL,
	TSK_TOKEN_ADDRESS,
} from "@/lib/constant";
import CourseManager from "../assets/abis/CourseManager.json";
import TokenExchangeManager from "../assets/abis/TokenExchange.json";
import TSKToken from "../assets/abis/TSKToken.json";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { useWallet } from "../hooks/useWallet";
import type { Course } from "../types";
const { toast } = useToast();
const StudentPage: React.FC = () => {
	const { walletState, refreshBalance } = useWallet();
	const [courses, setCourses] = useState<Course[]>([]);
	const [isLoadingCourses, setIsLoadingCourses] = useState(false);
	const { writeContract: writeApproveCourse, data: hashApproveCourse } =
		useWriteContract();
	const { writeContract: writeExchange, data: hashExchange } =
		useWriteContract();
	const { writeContract: writeExchangeTsk, data: hashExchangeTsk } =
		useWriteContract();
	const { writeContract: writeBuyCourse, data: hashBuyCourse } =
		useWriteContract();

	const { isLoading: isConfirmingApprove, isSuccess: isConfirmedApprove } =
		useWaitForTransactionReceipt({
			hash: hashApproveCourse,
		});

	const { isLoading: isConfirmingExchange, isSuccess: isConfirmedExchange } =
		useWaitForTransactionReceipt({
			hash: hashExchange,
		});

	const {
		isLoading: isConfirmingExchangeTsk,
		isSuccess: isConfirmedExchangeTsk,
	} = useWaitForTransactionReceipt({
		hash: hashExchangeTsk,
	});

	const { isLoading: isConfirmingBuy, isSuccess: isConfirmedBuy } =
		useWaitForTransactionReceipt({
			hash: hashBuyCourse,
		});

	const [buyCourseData, setBuyCourseData] = useState({
		courseId: "",
		address: "",
		authorAddress: "",
	});
	const [ethAmount, setEthAmount] = useState("");
	const [isExchanging, setIsExchanging] = useState(false);
	const [tskAmount, setTskAmount] = useState("");
	const [isExchangingTsk, setIsExchangingTsk] = useState(false);

	// 获取TSK代币余额
	const { data: tskBalance, refetch: refetchTskBalance } = useReadContract({
		address: TSK_TOKEN_ADDRESS,
		abi: TSKToken.abi,
		functionName: "balanceOf",
		args: walletState.address ? [walletState.address] : undefined,
		query: {
			enabled: !!walletState.address,
		},
	});

	// 监听approve交易确认
	useEffect(() => {
		if (isConfirmedApprove && hashApproveCourse) {
			toast({
				title: "授权成功",
				description: "TSK代币授权成功，现在可以购买课程",
			});
		}
	}, [isConfirmedApprove, hashApproveCourse, toast]);


	const navigate = useNavigate();

	// 加载课程列表的函数
	const loadCourses = async () => {
		setIsLoadingCourses(true);
		try {
			// 模拟课程数据
			fetch(`${FETCH_URL}/api/getAllCourses`)
				.then((res) => res.json())
				.then((data) => {
					if (data.code === 200) {
						setCourses(data.data);
					} else {
						toast({
							title: "错误",
							description: "加载课程失败，请刷新页面重试",
							variant: "destructive",
						});
					}
				});
		} catch (_error) {
			setCourses([]);
			toast({
				title: "错误",
				description: "加载课程失败，请刷新页面重试",
				variant: "destructive",
			});
		} finally {
			setIsLoadingCourses(false);
		}
	};

	useEffect(() => {
		loadCourses();
	}, []);

	// 代币交换处理函数
	const handleTokenExchange = () => {
		if (!ethAmount || parseFloat(ethAmount) <= 0) {
			toast({
				title: "输入错误",
				description: "请输入有效的ETH数量",
				variant: "destructive",
			});
			return;
		}
		setIsExchanging(true);
		writeExchange({
			address: EXCHANGE_ADDRESS,
			abi: TokenExchangeManager.abi,
			functionName: "buyToken",
			value: parseEther(ethAmount), // 发送ETH作为value
		});
	};

	useEffect(() => {
		if (isConfirmedExchange && hashExchange) {
			const ethValue = parseFloat(ethAmount);
			const tskValue = Number.isNaN(ethValue) ? 0 : ethValue * 1000;

			toast({
				title: "交换成功",
				description: `成功将 ${ethAmount} ETH 兑换为 ${tskValue.toFixed(2)} TSK`,
			});
			setEthAmount(""); // 清空输入
			setIsExchanging(false);
			// 刷新TSK代币余额和ETH余额
			refetchTskBalance();
			refreshBalance();
		}
	}, [
		isConfirmedExchange,
		hashExchange,
		ethAmount, // 刷新TSK代币余额和ETH余额
		refetchTskBalance,
		refreshBalance,
		toast,
	]);

	// TSK交换ETH处理函数
	const handleTskExchange = () => {
		if (!tskAmount || parseFloat(tskAmount) <= 0) {
			toast({
				title: "输入错误",
				description: "请输入有效的TSK数量",
				variant: "destructive",
			});
			return;
		}
		setIsExchangingTsk(true);
		writeExchangeTsk({
			address: EXCHANGE_ADDRESS,
			abi: TokenExchangeManager.abi,
			functionName: "sellToken",
			args: [parseEther(tskAmount)],
		});
	};

	// 监听TSK交换交易确认
	useEffect(() => {
		if (isConfirmedExchangeTsk && hashExchangeTsk) {
			const tskValue = parseFloat(tskAmount);
			const ethValue = Number.isNaN(tskValue) ? 0 : tskValue / 1000;
			console.log("ethValue", ethValue);
			toast({
				title: "交换成功",
				description: `成功将 ${tskAmount} TSK 兑换为 ${ethValue.toFixed(4)} ETH`,
			});
			setTskAmount(""); // 清空输入
			setIsExchangingTsk(false);
			// 刷新TSK代币余额和ETH余额
			refetchTskBalance();
			refreshBalance();
		}
	}, [
		isConfirmedExchangeTsk,
		hashExchangeTsk, // 刷新TSK代币余额和ETH余额
		refetchTskBalance,
		refreshBalance,
		toast,
		tskAmount,
	]);

	const approveCourse = (price: number) => {
		const amount = Number(price) + 2;
		writeApproveCourse({
			address: TSK_TOKEN_ADDRESS,
			abi: TSKToken.abi,
			functionName: "approve",
			args: [COURSE_MANAGER_ADDRESS, parseEther(amount.toString())], // TSK代币也使用18位精度
		});
	};

	const buyCourse = (
		courseId: string,
		price: number,
		authorAddress: string,
	) => {
		setBuyCourseData({
			courseId,
			address: walletState.address!,
			authorAddress,
		});
		writeBuyCourse({
			address: COURSE_MANAGER_ADDRESS,
			abi: CourseManager.abi,
			functionName: "buyCourse",
			args: [courseId, parseEther((Number(price) + 2).toString())], // 将courseId转换为数字类型
		});
	};

	const executeWeb2Operation = () => {
		fetch(`${FETCH_URL}/api/buyCourse`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(buyCourseData),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.code === 200) {
					toast({
						title: "购买课程成功",
						description: "购买课程成功",
					});
					// 购买成功后刷新课程列表
					loadCourses();
				}
			})
			.catch((error) => {
				console.error("购买课程失败:", error);
				toast({
					title: "购买失败",
					description: "购买课程失败，请重试",
					variant: "destructive",
				});
			});
	};

	useEffect(() => {
		if (isConfirmedBuy && hashBuyCourse) {
			executeWeb2Operation();
		}
	}, [isConfirmedBuy, hashBuyCourse]);

	return (
		<div className="space-y-8 mt-8">
			{/* 页面标题 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<BookOpen className="h-8 w-8 text-primary" />
					<h1 className="text-3xl font-bold">Web3大学 - 学生平台</h1>
				</div>
			</div>

			{/* 钱包状态提示 */}
			{!walletState.isConnected && (
				<Alert className="p-4">
					<Info className="h-5 w-5" />
					<AlertDescription className="text-base">
						欢迎来到Web3大学！您可以浏览课程，连接钱包后可以查看详细信息。
					</AlertDescription>
				</Alert>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* 左侧：课程列表 */}
				<div className="lg:col-span-3">
					{isLoadingCourses ? (
						<div className="flex items-center justify-center py-20">
							<Loader2 className="h-10 w-10 animate-spin text-primary mr-4" />
							<span className="text-xl text-muted-foreground">
								正在加载课程...
							</span>
						</div>
					) : courses.length === 0 ? (
						<div className="text-center py-20">
							<BookOpen className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
							<h3 className="text-2xl font-medium text-muted-foreground mb-4">
								暂无课程
							</h3>
							<p className="text-lg text-muted-foreground">
								目前还没有可用的课程
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-8">
							{courses.map((course) => (
								<Card
									key={course.courseId}
									className="h-[32rem] flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
								>
									<CardHeader className="p-3">
										{/* 课程封面 */}
										{course.cover && (
											<div className="mb-2 overflow-hidden rounded-xl">
												<img
													src={course.cover}
													alt={course.title}
													className="w-full h-40 object-cover object-center"
													onError={(e) => {
														e.currentTarget.style.display = "none";
													}}
												/>
											</div>
										)}

										<CardTitle className="text-xl line-clamp-2 leading-tight">
											{course.title}
										</CardTitle>
									</CardHeader>

									<CardContent className="space-y-2 flex-1 flex flex-col p-3">
										{/* 课程描述 */}
										{course.description && (
											<div className="text-muted-foreground line-clamp-2 text-base leading-relaxed">
												{course.description}
											</div>
										)}

										{/* 课程内容预览 */}
										<div className="text-muted-foreground line-clamp-2 flex-1 text-sm leading-relaxed">
											<MarkdownRenderer
												content={
													course.content.length > 60
														? `${course.content.substring(0, 60)}...`
														: course.content
												}
											/>
										</div>

										{/* 查看详情按钮 */}
										{course.content.length > 60 && (
											<Button
												variant="link"
												size="sm"
												className="p-0 h-auto text-primary hover:text-primary/80 self-start text-base"
												onClick={() => navigate(`/course/${course.courseId}`)}
											>
												查看完整内容 →
											</Button>
										)}

										{/* 底部操作区域 */}
										<div className="mt-auto space-y-4">
											<div className="flex justify-between items-center">
												<div className="text-base text-muted-foreground">
													<span>
														作者:
														{course.authorName.length > 10
															? course.authorName.slice(0, 6) +
																"..." +
																course.authorName.slice(-4)
															: course.authorName}
													</span>
												</div>
												<Badge
													variant="outline"
													className="px-4 py-2 text-base font-medium"
												>
													{course.price} TSK
												</Badge>
											</div>
											<span className=" text-base font-medium">
												购买人数: {course.buyers.length}
											</span>
											{course?.buyers?.includes(walletState.address || "") ? (
												<Button
													onClick={() => navigate(`/course/${course.courseId}`)}
													className="w-full text-base h-12"
												>
													<BookOpen className="mr-2 h-5 w-5" />
													查看课程详情
												</Button>
											) : (
												<div className="flex  gap-2">
													<Button
														onClick={() => approveCourse(course.price)}
														className="w-full text-base h-12"
														disabled={isConfirmingApprove}
													>
														<Check className="mr-2 h-5 w-5" />
														{isConfirmingApprove ? "授权中..." : "Approve"}
													</Button>

													<Button
														onClick={() =>
															buyCourse(
																course.courseId,
																course.price,
																course.authorAddress,
															)
														}
														className="w-full text-base h-12"
														disabled={isConfirmingBuy || isConfirmingApprove}
													>
														<ShoppingCart className="mr-2 h-5 w-5" />
														{isConfirmingBuy ? "购买中..." : "购买"}
													</Button>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>

				{/* 右侧：钱包信息 */}
				<div className="space-y-8 lg:col-span-1 flex-shrink-0">
					{/* 代币交换 */}
					<Card className="w-full">
						<CardHeader className="pb-4">
							<CardTitle className="flex items-center gap-2 text-lg">
								<Coins className="h-5 w-5 text-yellow-500" />
								代币交换
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700">
									输入ETH数量
								</label>
								<Input
									type="number"
									placeholder="0.0"
									value={ethAmount}
									onChange={(e) => setEthAmount(e.target.value)}
									className="w-full"
									step="0.01"
									min="0"
								/>
							</div>

							{/* 显示TSK代币余额 */}
							<div className="bg-gray-50 p-3 rounded-lg">
								<div className="text-sm text-gray-600 mb-1">当前TSK余额</div>
								<div className="text-lg font-semibold text-green-600">
									{tskBalance ? (Number(tskBalance) / 1e18).toFixed(2) : "0.00"}{" "}
									TSK
								</div>
							</div>

							<div className="text-center text-sm text-gray-600">
								<div className="mb-2">汇率: 1 ETH = 1000 TSK</div>
								{ethAmount && (
									<div className="text-lg font-semibold text-blue-600">
										将获得: {(parseFloat(ethAmount) * 1000).toFixed(2)} TSK
									</div>
								)}
							</div>

							<Button
								onClick={handleTokenExchange}
								disabled={
									isExchanging ||
									isConfirmingExchange ||
									!ethAmount ||
									parseFloat(ethAmount) <= 0
								}
								className="w-full"
							>
								{isExchanging || isConfirmingExchange
									? "交换中..."
									: "确认交换"}
							</Button>
						</CardContent>
					</Card>

					{/* TSK交换ETH */}
					<Card className="w-full">
						<CardHeader className="pb-4">
							<CardTitle className="flex items-center gap-2 text-lg">
								<Coins className="h-5 w-5 text-blue-500" />
								TSK交换ETH
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700">
									输入TSK数量
								</label>
								<Input
									type="number"
									placeholder="0.0"
									value={tskAmount}
									onChange={(e) => setTskAmount(e.target.value)}
									className="w-full"
									step="0.01"
									min="0"
								/>
							</div>

							{/* 显示TSK代币余额 */}
							<div className="bg-gray-50 p-3 rounded-lg">
								<div className="text-sm text-gray-600 mb-1">当前TSK余额</div>
								<div className="text-lg font-semibold text-green-600">
									{tskBalance ? (Number(tskBalance) / 1e18).toFixed(2) : "0.00"}{" "}
									TSK
								</div>
							</div>

							<div className="text-center text-sm text-gray-600">
								<div className="mb-2">汇率: 1000 TSK = 1 ETH</div>
								{tskAmount && (
									<div className="text-lg font-semibold text-blue-600">
										将获得: {(parseFloat(tskAmount) / 1000).toFixed(4)} ETH
									</div>
								)}
							</div>

							<Button
								onClick={handleTskExchange}
								disabled={
									isExchangingTsk ||
									isConfirmingExchangeTsk ||
									!tskAmount ||
									parseFloat(tskAmount) <= 0
								}
								className="w-full"
							>
								{isExchangingTsk || isConfirmingExchangeTsk
									? "交换中..."
									: "确认交换"}
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default StudentPage;
