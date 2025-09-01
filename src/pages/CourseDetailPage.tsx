import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Course } from '../types'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Alert, AlertDescription } from '../components/ui/alert'
import { useToast } from '../hooks/use-toast'
import { ArrowLeft, BookOpen, Users, Calendar, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { WorkersAPIService, API_CONFIG } from '../services/api'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { useWallet } from '../hooks/useWallet'
import COURSE_MANAGER_ABI_DATA from '../assets/abis/CourseManager.json'

// CourseManager合约ABI
const COURSE_MANAGER_ABI = COURSE_MANAGER_ABI_DATA.abi

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { walletState } = useWallet()
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)



  // 加载课程详情
  useEffect(() => {
    const loadCourseDetail = async () => {
      if (!courseId) return

      setIsLoading(true)
      setError(null)

      try {
        // 从所有课程中查找指定课程
        const result = await WorkersAPIService.getAllCourses()
        const allCourses = result.courses || []
        
        const foundCourse = allCourses.find((c: any) => c.courseId === courseId)
        
        if (foundCourse) {
          // 通过buyer数组是否包含当前地址来判断是否已购买
          // 使用toLowerCase()确保大小写不敏感的比较
          const isPurchased = foundCourse.buyer && foundCourse.buyer.some((buyerAddress: string) => 
            buyerAddress.toLowerCase() === walletState.address?.toLowerCase()
          )
          
          // 转换为Course格式
          const formattedCourse: Course = {
            id: foundCourse.courseId,
            title: foundCourse.title,
            content: foundCourse.content,
            price: foundCourse.cost,
            description: foundCourse.description || '',
            cover: foundCourse.cover || '',
            buyer: foundCourse.buyer || [],
            txHash: foundCourse.txHash || '',
            author: '未知作者',
            authorAddress: foundCourse.address || '',
            isPurchased: isPurchased, // 通过buyer数组判断购买状态
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          
          setCourse(formattedCourse)
        } else {
          setError('课程不存在')
        }
      } catch (error) {
        console.error('加载课程详情失败:', error)
        setError('加载课程详情失败，请重试')
      } finally {
        setIsLoading(false)
      }
    }

    loadCourseDetail()
  }, [courseId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">正在加载课程详情...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error || '课程不存在'}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 返回按钮 */}
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
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
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            
            {/* 课程基本信息 */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
              
              {/* 课程ID */}
              <div className="text-sm text-muted-foreground mb-3">
                课程ID: {course.id}
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
                  <span>购买者: {course.buyer.length} 人</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>创建时间: {new Date(course.createdAt).toLocaleDateString()}</span>
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
            <MarkdownRenderer 
              content={course.content} 
              className="text-base leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>

      {/* 购买者列表 */}
      {course.buyer && course.buyer.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">购买者列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {course.buyer.map((buyer, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {buyer.slice(2, 4).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {buyer}
                    </p>
                    <p className="text-xs text-gray-500">
                      购买者 #{index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 交易信息 */}
      {course.txHash && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">交易信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="font-mono text-sm">
                {course.txHash}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open(`https://sepolia.etherscan.io/tx/${course.txHash}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CourseDetailPage
