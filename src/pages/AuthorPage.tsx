import React, { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { Course } from '../types'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'

import { Plus, BookOpen, Info, Wallet } from 'lucide-react'
import { WorkersAPIService } from '../services/api'
import { useNavigate } from 'react-router-dom'


// 使用统一的API服务

// 课程数据将从Cloudflare Workers KV中加载

const AuthorPage: React.FC = () => {
  const { walletState, disconnectWallet } = useWallet()

  const [createdCourses, setCreatedCourses] = useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)
  const navigate = useNavigate()

  // 当钱包连接时，加载Workers中的课程数据
  useEffect(() => {
    const loadWorkersCourses = async () => {
      if (walletState.isConnected && walletState.address) {
        setIsLoadingCourses(true)
        try {
          const result = await WorkersAPIService.getUserCourses(walletState.address)
          const courses = result.courses || []

          // 将Workers数据转换为Course格式并更新createdCourses
          const formattedCourses: Course[] = courses.map((course: any) => ({
            id: course.courseId,
            title: course.title,
            content: course.content,
            price: course.cost,
            description: course.description || '',
            cover: course.cover || '',
            buyer: course.buyer || [],
            txHash: course.txHash || '',
            author: '当前用户',
            authorAddress: walletState.address || '',
            isPurchased: false,
            createdAt: Date.now(), // 由于KV中没有时间戳，使用当前时间
            updatedAt: Date.now(),
          }))

          setCreatedCourses(formattedCourses)

        } catch (error) {
          console.error('加载Workers课程失败:', error)
          setCreatedCourses([])
        } finally {
          setIsLoadingCourses(false)
        }
      } else {
        // 钱包未连接时清空课程列表
        setCreatedCourses([])
        setIsLoadingCourses(false)
      }
    }

    loadWorkersCourses()
  }, [walletState.isConnected, walletState.address])



  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Web3大学 - 作者平台</h1>
        </div>
      </div>

      {/* 已创建课程 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">已创建课程</h2>
          <Button
            onClick={() => navigate('/create-course')}
            disabled={!walletState.isConnected}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>创建课程</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingCourses ? (
            <div className="text-center py-8 col-span-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">正在加载课程数据...</p>
            </div>
          ) : createdCourses.length > 0 ? (
            createdCourses.map((course) => (
              <Card key={course.id} className="bg-purple-50 border-purple-200 h-96 flex flex-col">
                <CardContent className="p-4 h-full flex flex-col">
                  <div className="flex flex-col h-full">
                    {/* 课程封面 */}
                    {course.cover && (
                      <div className="mb-3 overflow-hidden rounded-lg border border-purple-200">
                        <img 
                          src={course.cover} 
                          alt={course.title}
                          className="w-full h-32 object-cover object-center"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    
                    {/* 课程信息 */}
                    <div className="flex-1 flex flex-col">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{course.title}</CardTitle>
                      
                      {/* 课程ID */}
                      <div className="text-xs text-muted-foreground mb-2">
                        课程ID: {course.id}
                      </div>
                      
                      {/* 课程描述 */}
                      {course.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                      
                      {/* 课程内容预览（只显示前100个字符） */}
                      <div className="mb-3 flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {course.content.length > 100 
                            ? `${course.content.substring(0, 100)}...` 
                            : course.content
                          }
                        </p>
                        {course.content.length > 100 && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 h-auto text-primary hover:text-primary/80"
                            onClick={() => navigate(`/course/${course.id}`)}
                          >
                            查看完整内容 →
                          </Button>
                        )}
                      </div>

                      {/* 底部信息 */}
                      <div className="mt-auto space-y-2">
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>价格: {course.price} TSK</span>
                          <span>创建时间: {new Date(course.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        {/* 购买者信息 - 只显示人数 */}
                        {course.buyer && course.buyer.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <span>购买者: {course.buyer.length} 人</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 col-span-full">
              <p className="text-muted-foreground">
                {walletState.isConnected ? '暂无课程，点击上方按钮创建第一个课程' : '请先连接钱包'}
              </p>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}

export default AuthorPage
