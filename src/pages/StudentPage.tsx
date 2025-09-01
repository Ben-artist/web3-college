import React, { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { Course } from '../types'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

import { Badge } from '../components/ui/badge'
import { Alert, AlertDescription } from '../components/ui/alert'
import { useToast } from '../hooks/use-toast'
import { BookOpen, Wallet, Info, Loader2, ShoppingCart, Shield } from 'lucide-react'
import { useWriteContract, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import COURSE_MANAGER_ABI_DATA from '../assets/abis/CourseManager.json'
import TSK_TOKEN_ABI_DATA from '../assets/abis/TSKToken.json'
import { WorkersAPIService, API_CONFIG } from '../services/api'
import { useNavigate } from 'react-router-dom'
import TokenExchange from '../components/TokenExchange'

// 格式化TSK余额显示
const formatTSKBalance = (balance: bigint | undefined): string => {
  if (!balance) return '0 TSK'
  
  const balanceNumber = Number(formatEther(balance))
  
  if (balanceNumber >= 1000000) {
    return `${(balanceNumber / 1000000).toFixed(2)}M TSK`
  } else if (balanceNumber >= 1000) {
    return `${(balanceNumber / 1000).toFixed(2)}K TSK`
  } else if (balanceNumber >= 1) {
    return `${balanceNumber.toFixed(2)} TSK`
  } else {
    return `${balanceNumber.toFixed(6)} TSK`
  }
}

// 合约ABI
const COURSE_MANAGER_ABI = COURSE_MANAGER_ABI_DATA.abi
const TSK_TOKEN_ABI = TSK_TOKEN_ABI_DATA.abi

const StudentPage: React.FC = () => {
  const { walletState, disconnectWallet } = useWallet()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)

  const [pendingPurchaseCourseId, setPendingPurchaseCourseId] = useState<string | null>(null)
  const [approvingCourseId, setApprovingCourseId] = useState<string | null>(null) // 🆕 添加独立的approve loading状态
  const { toast } = useToast()

  // Wagmi合约调用hooks
  const { writeContract, data: approveData, error: approveError } = useWriteContract()

  // 购买课程相关的hooks
  const { writeContract: writeCourseManagerContract, data: courseManagerData, error: courseManagerError, isPending: isCourseManagerPending } = useWriteContract()

  // 读取TSK余额
  const { data: tskBalance, refetch: refetchTSKBalance } = useReadContract({
    address: API_CONFIG.TSK_TOKEN_ADDRESS as `0x${string}`,
    abi: TSK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [walletState.address as `0x${string}`],
    // 这里的 query 配置是用来控制 useReadContract 这个 hook 是否启用的
    // enabled: !!walletState.address 的意思是：只有当钱包地址存在时，才会去读取TSK余额
    // !!walletState.address 会把地址转成布尔值（有地址为true，无地址为false）
    query: {
      enabled: !!walletState.address,
    },
  })

  // 检查TSK余额是否足够
  const checkTSKBalance = (requiredAmount: number) => {
    if (!tskBalance) return false
    // TSK代币有18位小数，需要转换为wei单位进行比较
    const requiredWei = parseEther(requiredAmount.toString())
    return Number(tskBalance) >= Number(requiredWei)
  }

  // 监听approve结果
  useEffect(() => {
    if (approveData) {
      toast({
        title: "授权成功",
        description: "TSK代币授权成功！现在可以购买课程了",
      })
      // 授权成功后刷新TSK余额
      refetchTSKBalance()
      // 清理approve loading状态
      setApprovingCourseId(null)
    }
  }, [approveData, refetchTSKBalance, toast])

  useEffect(() => {
    if (approveError) {
      toast({
        title: "授权失败",
        description: `授权失败: ${approveError.message}`,
        variant: "destructive",
      })
      // 清理approve loading状态
      setApprovingCourseId(null)
    }
  }, [approveError, toast])



  // 🆕 监听buyCourse交易状态
  useEffect(() => {
    if (courseManagerData && pendingPurchaseCourseId) {
      toast({
        title: "购买成功",
        description: "您已成功购买课程！您的地址已添加到买家列表中。",
      })

      // 🆕 购买成功后，更新本地状态
      setCourses(prev => prev.map(course => {
        if (course.id === pendingPurchaseCourseId && walletState.address) {
          // 将当前用户地址添加到buyer列表中
          const updatedBuyers = [...(course.buyer || []), walletState.address]
          return { 
            ...course, 
            isPurchased: true,
            buyer: updatedBuyers
          }
        }
        return course
      }))

      // 清理pendingPurchaseCourseId
      setPendingPurchaseCourseId(null)

      // 刷新TSK余额
      refetchTSKBalance()
    }
  }, [courseManagerData, refetchTSKBalance, toast, pendingPurchaseCourseId, walletState.address])

  useEffect(() => {
    if (courseManagerError) {
      toast({
        title: "购买失败",
        description: `购买课程失败: ${courseManagerError.message}`,
        variant: "destructive",
      })

      // 🆕 购买失败时，清理pendingPurchaseCourseId
      if (pendingPurchaseCourseId) {
        setPendingPurchaseCourseId(null)

      }
    }
  }, [courseManagerError, toast, pendingPurchaseCourseId])





  // 加载所有课程数据
  useEffect(() => {
    const loadCourses = async () => {
      if (!walletState.isConnected || !walletState.address) {
        setCourses([])
        return
      }

      setIsLoadingCourses(true)
      try {
        const result = await WorkersAPIService.getAllCourses()
        const allCourses = result.courses || []

        // 将Workers数据转换为Course格式
        const formattedCourses: Course[] = allCourses.map((course: any) => {
          // 通过buyer数组是否包含当前地址来判断是否已购买
          // 使用toLowerCase()确保大小写不敏感的比较
          const isPurchased = course.buyer && course.buyer.some((buyerAddress: string) => 
            buyerAddress.toLowerCase() === walletState.address?.toLowerCase()
          )
          
          return {
            id: course.courseId,
            title: course.title,
            content: course.content,
            price: course.cost,
            description: course.description || '',
            cover: course.cover || '',
            buyer: course.buyer || [],
            txHash: course.txHash || '',
            author: '未知作者', // Workers中没有作者信息，使用默认值
            authorAddress: course.address || '',
            isPurchased: isPurchased, // 通过buyer数组判断购买状态
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
        })

        setCourses(formattedCourses)

      } catch (error) {
        console.error('加载课程失败:', error)
        setCourses([])
        toast({
          title: "错误",
          description: "加载课程失败，请刷新页面重试",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCourses(false)
      }
    }

    loadCourses()
  }, [walletState.isConnected, walletState.address, toast])

  // 处理课程购买
  const handlePurchaseCourse = async (courseId: string) => {
    if (!walletState.isConnected) {
      toast({
        title: "提示",
        description: "请先连接钱包",
        variant: "destructive",
      })
      return
    }

    try {
      // 找到要购买的课程
      const courseToPurchase = courses.find(course => course.id === courseId)
      if (!courseToPurchase) {
        throw new Error('课程不存在')
      }

      // 检查用户TSK余额是否足够
      if (!checkTSKBalance(courseToPurchase.price)) {
        const currentBalanceWei = (tskBalance as bigint) || BigInt(0)
        const currentBalanceTSK = formatTSKBalance(currentBalanceWei)
        const requiredTSK = courseToPurchase.price

        toast({
          title: "余额不足",
          description: `您的TSK余额不足，需要${requiredTSK} TSK，当前余额${currentBalanceTSK}`,
          variant: "destructive",
        })
        return
      }




      // 🆕 检查作者地址是否有效
      if (!courseToPurchase.authorAddress || courseToPurchase.authorAddress === '') {
        throw new Error('课程作者地址无效，无法完成购买')
      }

      // 调用CourseManager合约的buyCourse函数
      // 这个函数会处理所有的转账逻辑：从用户转TSK到合约，然后转给作者
      const courseIdNumber = parseInt(courseId.replace('course-', '').split('-')[0])
      const buyCourseParams = {
        address: API_CONFIG.COURSE_MANAGER_ADDRESS as `0x${string}`,
        abi: COURSE_MANAGER_ABI,
        functionName: 'buyCourse',
        args: [
          courseIdNumber,
          courseToPurchase.authorAddress as `0x${string}`,
          parseEther(courseToPurchase.price.toString())
        ]
      }

      // 设置要购买的课程ID，等待交易成功后更新状态
      setPendingPurchaseCourseId(courseId)

      // 调用CourseManager合约的buyCourse函数
      writeCourseManagerContract(buyCourseParams)

      // 刷新TSK余额
      refetchTSKBalance()

      toast({
        title: "开始购买",
        description: `正在向作者转账${courseToPurchase.price} TSK，请等待交易确认...`,
      })



    } catch (error) {
      console.error('购买课程失败:', error)

      let errorMessage = '购买失败，请重试';
      if (error instanceof Error) {
        errorMessage = `购买失败: ${error.message}`;
      }

      toast({
        title: "错误",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }



  // 处理课程授权
  const handleApproveCourse = async (course: Course) => {
    if (!walletState.isConnected) {
      toast({
        title: "提示",
        description: "请先连接钱包",
        variant: "destructive",
      })
      return
    }

    try {
      // 🆕 设置当前课程的approve loading状态
      setApprovingCourseId(course.id)
      
      // 调用TSKToken合约的approve方法
      // 授权CourseManager合约使用TSK代币
      const courseManagerAddress = API_CONFIG.COURSE_MANAGER_ADDRESS
      // 🆕 修复：Approve数额 = 课程价格 + 2
      const approveAmount = course.price + 2
      const amount = parseEther(approveAmount.toString())



      writeContract({
        address: API_CONFIG.TSK_TOKEN_ADDRESS as `0x${string}`,
        abi: TSK_TOKEN_ABI,
        functionName: 'approve',
        args: [courseManagerAddress as `0x${string}`, amount],
      })

      toast({
        title: "授权中",
        description: `正在授权CourseManager合约使用${approveAmount} TSK代币（课程价格${course.price} + 2）...`,
      })
    } catch (error) {
      console.error('授权失败:', error)
      toast({
        title: "错误",
        description: "授权失败，请重试",
        variant: "destructive",
      })
      // 清理loading状态
      setApprovingCourseId(null)
    }
  }

  const navigate = useNavigate()



  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Web3大学 - 学生平台</h1>
        </div>


      </div>

      {/* 钱包状态提示 */}
      {!walletState.isConnected && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            请先连接钱包以使用完整功能
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 左侧：课程列表 */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-semibold mb-3">可用课程</h2>

          {isLoadingCourses ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
              <span className="text-lg text-muted-foreground">正在加载课程...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">暂无课程</h3>
              <p className="text-sm text-muted-foreground">目前还没有可用的课程</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                                  <Card
                    key={course.id}
                    className={`course-card ${course.isPurchased ? 'purchased' : ''} h-[24rem] flex flex-col`}
                  >
                  <CardHeader className="pb-2 px-4 pt-4">
                    {/* 课程封面 */}
                    {course.cover && (
                      <div className="mb-2 overflow-hidden rounded-lg">
                        <img
                          src={course.cover}
                          alt={course.title}
                          className="w-full h-24 object-cover object-center"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}

                    <CardTitle className="text-base line-clamp-1">{course.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-1 flex-1 flex flex-col px-4 pb-4">
                    {/* 课程描述 */}
                    {course.description && (
                      <div className="text-muted-foreground line-clamp-1 text-xs">
                        {course.description}
                      </div>
                    )}

                    {/* 课程内容预览（更短的截断） */}
                    <div className="text-muted-foreground line-clamp-2 flex-1 text-xs">
                      {course.content.length > 50
                        ? `${course.content.substring(0, 20)}...`
                        : course.content
                      }
                    </div>

                    {/* 查看详情按钮 */}
                    {course.content.length > 50 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-primary hover:text-primary/80 self-start text-xs"
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        查看完整内容 →
                      </Button>
                    )}

                    {/* 底部操作区域 */}
                    <div className="mt-auto space-y-2 pt-2">
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          {course.buyer && course.buyer.length > 0 ? (
                            <span>{course.buyer.length} 人已购买</span>
                          ) : (
                            <span>暂无购买者</span>
                          )}
                        </div>
                        <Badge variant="outline" className="px-2 py-0.5 text-xs">
                          {course.price} TSK
                        </Badge>
                      </div>

                      {/* 购买课程按钮 */}
                      <div className="flex gap-1">
                        {/* Approve按钮 - 授权TSK代币 */}
                        {!course.isPurchased && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveCourse(course)}
                            disabled={approvingCourseId === course.id}
                            className="flex-1 text-xs h-8"
                          >
                            {approvingCourseId === course.id ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Approve...
                              </>
                            ) : (
                              <>
                                <Shield className="mr-1 h-3 w-3" />
                                Approve
                              </>
                            )}
                          </Button>
                        )}

                        {/* 购买按钮 */}
                        <Button
                          onClick={() => course.isPurchased ? navigate(`/course/${course.id}`) : handlePurchaseCourse(course.id)}
                          disabled={!course.isPurchased && isCourseManagerPending}
                          className="flex-1 text-xs h-8"
                        >
                          {isCourseManagerPending ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              购买中...
                            </>
                          ) : course.isPurchased ? (
                            <>
                              <BookOpen className="mr-1 h-3 w-3" />
                              查看课程
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="mr-1 h-3 w-3" />
                              购买课程
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 右侧：代币兑换和钱包信息 */}
        <div className="space-y-4 min-w-0 flex-shrink-0">
          {/* 代币兑换 - 使用新的TokenExchange组件 */}
          <TokenExchange />

          {/* 钱包信息 */}
          {walletState.isConnected && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5" />
                  <span>钱包信息</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">地址:</p>
                  <p className="text-xs font-mono bg-muted p-1.5 rounded break-all overflow-hidden">
                    {walletState.address}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">ETH余额:</p>
                  <p className="text-xs font-medium">
                    {walletState.balance || '0'} ETH
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">TSK余额:</p>
                  <p className="text-xs font-medium">
                    {tskBalance ? formatTSKBalance(tskBalance as bigint) : '0 TSK'}
                  </p>
                </div>

                {/* 断开连接按钮 */}
                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                    className="w-full h-8 text-xs"
                  >
                    <Wallet className="mr-1 h-3 w-3" />
                    断开连接
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentPage
