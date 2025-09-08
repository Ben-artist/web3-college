import React, { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Alert, AlertDescription } from '../components/ui/alert'
import { useToast } from '../hooks/use-toast'
import { BookOpen, Info, Save, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MarkdownRenderer } from '../components/MarkdownRenderer.tsx'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import CourseManager from '../assets/abis/CourseManager.json'
import { parseEther } from 'viem'
import { COURSE_MANAGER_ADDRESS, FETCH_URL } from '@/lib/constant'
const CreateCoursePage: React.FC = () => {
  const { walletState } = useWallet()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { writeContract, data: hash, isPending: isWritingContract, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })
  const [courseData, setCourseData] = useState({
    courseId: '',
    title: '',
    content: '',
    price: '',
    description: '',
    cover: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // 监听区块链交易状态
  useEffect(() => {
    if (isConfirmed && hash) {
      // 区块链交易确认成功，现在执行 Web2 操作
      executeWeb2Operation()
    }
  }, [isConfirmed, hash])

  // 监听区块链交易错误
  useEffect(() => {
    if (writeError) {
      console.error('区块链交易失败:', writeError)
      toast({
        title: "区块链交易失败",
        description: "请检查网络连接和钱包状态，然后重试",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }, [writeError])

  // 处理输入变化
  const handleInputChange = (field: string, value: string) => {
    setCourseData(prev => ({ ...prev, [field]: value }))
  }

  // 打开预览弹窗
  const handleOpenPreview = () => {
    setShowPreviewModal(true)
  }

  // 关闭预览弹窗
  const handleClosePreview = () => {
    setShowPreviewModal(false)
  }

  // 执行 Web2 操作（在区块链确认后）
  const executeWeb2Operation = async () => {
    try {
      toast({
        title: "区块链确认成功",
        description: "正在保存到服务器...",
      })

      // 调用 Web2 API
      const response = await fetch(`${FETCH_URL}/api/createCourse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...courseData,
          authorAddress: walletState.address,
          // 使用已经设置好的courseId，不再重新生成
        }),
      })

      const data = await response.json()

      if (data.code === 200) {
        toast({
          title: "课程创建成功！",
          description: `区块链交易: ${hash?.slice(0, 10)}...`,
        })
        navigate('/author')
      } else {
        throw new Error(data.message || '服务器保存失败')
      }
    } catch (error) {
      toast({
        title: "服务器保存失败",
        description: "区块链已确认，但服务器保存失败。请联系管理员。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 创建课程 - 先写入区块链，确认后再执行 Web2 操作
  const handleCreateCourse = async () => {
    if (!courseData.title || !courseData.content || !courseData.price) {
      toast({
        title: "提示",
        description: "请填写完整的课程信息（标题、内容、价格）",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // 生成唯一的courseId（使用时间戳的简化版本）
      const courseId = Math.floor(Date.now() / 1000) // 使用秒级时间戳，更小更合理

      // 更新courseData状态
      setCourseData(prev => ({
        ...prev,
        courseId: courseId.toString()
      }))

      // 第一步：写入区块链
      toast({
        title: "开始创建课程",
        description: "正在写入区块链...",
      })

      writeContract({
        address: COURSE_MANAGER_ADDRESS,
        abi: CourseManager.abi,
        functionName: 'createCourse',
        args: [
          courseId,
          courseData.title,            // string
          parseEther(courseData.price.toString()) // 使用viem的parseEther将价格转换为wei (uint256)
        ],
      })

    } catch (error) {
      console.error('区块链写入失败:', error)
      toast({
        title: "区块链写入失败",
        description: error as string,
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 mt-8">
      {/* 页面标题和返回按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">创建新课程</h1>
        </div>
      </div>

      {/* 钱包状态提示 */}
      {!walletState.isConnected && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            请先连接钱包以创建课程
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-4xl mx-auto">
        {/* 课程创建表单 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>课程基本信息</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 课程标题 */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">课程标题 *</label>
                <Input
                  id="title"
                  value={courseData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="输入课程标题"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  请输入清晰、简洁的课程标题
                </p>
              </div>

              {/* 课程描述 */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">课程描述</label>
                <Textarea
                  id="description"
                  value={courseData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="输入课程简介描述（可选）"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  简洁描述课程内容和学习目标
                </p>
              </div>

              {/* 课程封面 */}
              <div className="space-y-2">
                <label htmlFor="cover" className="text-sm font-medium">课程封面</label>
                <div className="space-y-3">
                  {/* 封面图URL输入 */}
                  <Input
                    id="cover"
                    value={courseData.cover}
                    onChange={(e) => handleInputChange('cover', e.target.value)}
                    placeholder="封面图片URL（可选）"
                  />

                  {/* 封面图预览 */}
                  {courseData.cover && (
                    <div className="border rounded-lg p-2">
                      <img
                        src={courseData.cover}
                        alt="课程封面预览"
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          toast({
                            title: "图片加载失败",
                            description: "封面图片无法加载，请检查URL是否正确",
                            variant: "destructive",
                          })
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  输入图片URL，支持jpg、png等格式
                </p>
              </div>

              {/* 课程价格 */}
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">课程价格 *</label>
                <Input
                  id="price"
                  type="number"
                  value={courseData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="输入课程价格"
                />
                <p className="text-xs text-muted-foreground">价格单位：TSK</p>
              </div>
            </CardContent>
          </Card>

          {/* 课程内容 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>课程内容 *</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">课程内容</label>
                <Textarea
                  id="content"
                  value={courseData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="输入课程内容（支持Markdown格式）&#10;&#10;示例：&#10;# 课程标题&#10;&#10;## 第一章：基础知识&#10;&#10;- 列表项1&#10;- 列表项2&#10;&#10;**粗体文本** *斜体文本*&#10;&#10;[链接文本](https://example.com)"
                  rows={10}
                />
                <p className="text-xs text-muted-foreground">
                  支持Markdown格式，包括标题、列表、链接等
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 创建按钮 */}
          <div className="flex space-x-4">
            <Button
              onClick={handleCreateCourse}
              disabled={!walletState.isConnected || isLoading}
              className="flex-1"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isWritingContract ? '写入区块链中...' :
                    isConfirming ? '等待区块链确认...' :
                      '保存到服务器...'}
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  创建课程
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleOpenPreview}
              disabled={!courseData.title && !courseData.content}
              size="lg"
            >
              <Eye className="h-5 w-5 mr-2" />
              预览课程
            </Button>
          </div>
        </div>
      </div>

      {/* 课程预览弹窗 */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">课程预览</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClosePreview}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {courseData.cover && (
                <div>
                  <img
                    src={courseData.cover}
                    alt="课程封面"
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {courseData.title && (
                <div>
                  <h3 className="text-3xl font-bold mb-3">{courseData.title}</h3>
                  {courseData.description && (
                    <p className="text-lg text-muted-foreground mb-4">{courseData.description}</p>
                  )}
                  {courseData.price && (
                    <div className="text-lg text-muted-foreground">
                      价格: <span className="font-semibold text-primary">{courseData.price} TSK</span>
                    </div>
                  )}
                </div>
              )}

              {courseData.content && (
                <div className="border-t pt-6">
                  <h4 className="text-xl font-semibold mb-4">课程内容：</h4>
                  <MarkdownRenderer content={courseData.content} />
                </div>
              )}

              {!courseData.title && !courseData.content && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">请先填写课程信息</p>
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t bg-gray-50">
              <Button onClick={handleClosePreview} size="lg">
                关闭预览
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateCoursePage