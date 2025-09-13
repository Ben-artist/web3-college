import { ArrowLeft, BookOpen, Calendar, Users } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReadContract } from "wagmi";
import { COURSE_MANAGER_ADDRESS, FETCH_URL } from "@/lib/constant";
import CourseManager from "../assets/abis/CourseManager.json";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { useWallet } from "../hooks/useWallet";
import type { Course } from "../types";

const CourseDetailPage: React.FC = () => {
	const { walletState } = useWallet();
	const { courseId } = useParams<{ courseId: string }>();
	const navigate = useNavigate();
	const [course, setCourse] = useState<Course | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isBuyerInCourse, setIsBuyerInCourse] = useState(false);

	// 检查用户是否购买了课程
	const { data: buyerStatus } = useReadContract({
		abi: CourseManager.abi,
		address: COURSE_MANAGER_ADDRESS,
		functionName: "isBuyerInCourse",
		args: [courseId, walletState.address],
	});

	useEffect(() => {
		if (buyerStatus !== undefined) {
			setIsBuyerInCourse(buyerStatus as boolean);
		}
	}, [buyerStatus]);

	// 加载课程详情
	useEffect(() => {
		const loadCourseDetail = async () => {
			if (!courseId) return;

			setIsLoading(true);
			setError(null);

			try {
				// 从API获取课程详情
				const response = await fetch(`${FETCH_URL}/api/getAllCourses`);
				const data = await response.json();

				if (data.code === 200 && data.data) {
					const foundCourse = data.data.find(
						(c: Course) => c.courseId === courseId,
					);
					if (foundCourse) {
						setCourse(foundCourse);
					} else {
						setError("课程不存在");
					}
				} else {
					setError("加载课程详情失败，请重试");
				}
			} catch (error) {
				console.error("加载课程详情失败:", error);
				setError("加载课程详情失败，请重试");
			} finally {
				setIsLoading(false);
			}
		};

		loadCourseDetail();
	}, [courseId]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-lg text-muted-foreground">正在加载课程详情...</p>
				</div>
			</div>
		);
	}

	if (error || !course) {
		return (
			<div className="container mx-auto mt-4">
				<Alert variant="destructive">
					<AlertDescription>{error || "课程不存在"}</AlertDescription>
				</Alert>
				<Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
					<ArrowLeft className="h-4 w-4 mr-2" />
					返回
				</Button>
			</div>
		);
	}

	// 权限检查：如果用户没有购买课程，显示无权访问
	if (walletState.address && !isBuyerInCourse) {
		return (
			<div className="container mx-auto mt-4">
				<div className="text-center py-12">
					<div className="mb-6">
						<div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<BookOpen className="w-12 h-12 text-red-500" />
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">无权访问</h2>
						<p className="text-gray-600 mb-6">
							您需要先购买此课程才能查看详细内容
						</p>
					</div>

					<div className="space-y-4">
						<Button onClick={() => navigate("/student")} className="mr-4">
							返回课程列表
						</Button>
						<Button variant="outline" onClick={() => navigate(-1)}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							返回上一页
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto mt-4">
			{/* 返回按钮 */}
			<Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
				<ArrowLeft className="h-4 w-4 mr-2" />
				返回
			</Button>

			{/* 课程详情卡片 */}
			<Card className="mb-6">
				<CardHeader>
					<div className="flex items-start space-x-4">
						{/* 课程封面 */}
						{course.cover && (
							<div className="flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
								<img
									src={course.cover}
									alt={course.title}
									className="w-32 h-32 object-cover object-center"
									onError={(e) => {
										e.currentTarget.style.display = "none";
									}}
								/>
							</div>
						)}

						{/* 课程基本信息 */}
						<div className="flex-1 min-w-0">
							<CardTitle className="text-2xl mb-2">{course.title}</CardTitle>

							{/* 课程ID */}
							<div className="text-sm text-muted-foreground mb-3">
								课程ID: {course.courseId}
							</div>

							{/* 课程描述 */}
							{course.description && (
								<p className="text-muted-foreground mb-4">
									{course.description}
								</p>
							)}

							{/* 课程元信息 */}
							<div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
								<div className="flex items-center space-x-1">
									<BookOpen className="h-4 w-4" />
									<span>价格: {course.price} TSK</span>
								</div>

								<div className="flex items-center space-x-1">
									<Users className="h-4 w-4" />
									<span>购买者: {course.buyers?.length || 0} 人</span>
								</div>

								<div className="flex items-center space-x-1">
									<Calendar className="h-4 w-4" />
									<span>
										创建时间: {new Date(course.createdAt).toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* 课程内容 */}
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">课程内容</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="prose max-w-none">
						<MarkdownRenderer content={course.content} />
					</div>
				</CardContent>
			</Card>

			{/* 购买者列表 */}
			{course.buyers && course.buyers.length > 0 && (
				<Card className="mt-6">
					<CardHeader>
						<CardTitle className="text-xl">购买者列表</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
							{course.buyers.map((buyer: string) => (
								<div
									key={buyer}
									className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
								>
									<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
										<span className="text-sm font-medium text-primary">
											{buyer.slice(2, 4).toUpperCase()}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 truncate">
											{buyer}
										</p>
										<p className="text-xs text-gray-500">购买者 #{index + 1}</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default CourseDetailPage;
