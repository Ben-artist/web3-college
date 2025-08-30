import React, { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { Course } from '../types'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Alert, AlertDescription } from '../components/ui/alert'
import { useToast } from '../hooks/use-toast'
import { BookOpen, Wallet, Coins, Info } from 'lucide-react'

// 模拟课程数据
const mockCourses: Course[] = [
  {
    id: '1',
    title: '区块链基础入门',
    content: '学习区块链的基本概念和原理',
    price: 10,
    author: '张教授',
    authorAddress: '0x1234567890abcdef',
    isPurchased: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '2',
    title: '智能合约开发',
    content: '掌握Solidity语言和智能合约开发',
    price: 20,
    author: '李教授',
    authorAddress: '0xabcdef1234567890',
    isPurchased: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '3',
    title: 'DeFi协议分析',
    content: '深入理解去中心化金融协议',
    price: 15,
    author: '王教授',
    authorAddress: '0x9876543210fedcba',
    isPurchased: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

const StudentPage: React.FC = () => {
  const { walletState } = useWallet()
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [exchangeAmount, setExchangeAmount] = useState('')
  const { toast } = useToast()

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
      // 这里应该调用智能合约进行购买
      console.log('购买课程:', courseId)
      
      // 模拟购买成功
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, isPurchased: true }
          : course
      ))

      toast({
        title: "成功",
        description: "课程购买成功！",
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "购买失败，请重试",
        variant: "destructive",
      })
    }
  }

  // 处理代币兑换
  const handleExchangeTokens = async () => {
    if (!walletState.isConnected) {
      toast({
        title: "提示",
        description: "请先连接钱包",
        variant: "destructive",
      })
      return
    }

    if (!exchangeAmount || parseFloat(exchangeAmount) <= 0) {
      toast({
        title: "提示",
        description: "请输入有效的兑换数量",
        variant: "destructive",
      })
      return
    }

    try {
      // 这里应该调用智能合约进行代币兑换
      console.log('兑换代币:', exchangeAmount)
      
      toast({
        title: "成功",
        description: "代币兑换成功！",
      })
      
      setExchangeAmount('')
    } catch (error) {
      toast({
        title: "错误",
        description: "兑换失败，请重试",
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
      // 这里应该调用智能合约进行TSK代币授权
      console.log('授权课程:', course.title)
      
      toast({
        title: "成功",
        description: `课程 "${course.title}" 授权成功！`,
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "授权失败，请重试",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-3">
        <BookOpen className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Web3大学 - 学生平台</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧：课程列表 */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-semibold mb-4">可用课程</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <Card 
                key={course.id}
                className={`course-card ${course.isPurchased ? 'purchased' : ''}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground line-clamp-3">
                    {course.content}
                  </p>
                  
                  <div className="flex justify-end">
                    <Badge variant="outline" className="px-2 py-1">
                      {course.price} TSK
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApproveCourse(course)}
                      className="flex-1"
                    >
                      Approve
                    </Button>
                    
                    {course.isPurchased ? (
                      <Button
                        variant="default"
                        size="sm"
                        disabled
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        已购买
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handlePurchaseCourse(course.id)}
                        className="flex-1"
                      >
                        购买课程
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 右侧：代币兑换和钱包信息 */}
        <div className="space-y-6">
          {/* 代币兑换 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Coins className="h-5 w-5" />
                <span>兑换TSK币</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Input
                type="number"
                value={exchangeAmount}
                onChange={(e) => setExchangeAmount(e.target.value)}
                placeholder="输入要兑换的ETH数量"
              />
              
              <Button
                onClick={handleExchangeTokens}
                disabled={!walletState.isConnected}
                className="w-full"
              >
                确认兑换
              </Button>
              
              <p className="text-sm text-muted-foreground">
                当前汇率: 1 ETH = 100 TSK
              </p>
            </CardContent>
          </Card>

          {/* 钱包信息 */}
          {walletState.isConnected && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5" />
                  <span>钱包信息</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">地址:</p>
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    {walletState.address}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">ETH余额:</p>
                  <p className="text-sm font-medium">
                    {walletState.balance || '0'} ETH
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">TSK余额:</p>
                  <p className="text-sm font-medium">0 TSK</p>
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
