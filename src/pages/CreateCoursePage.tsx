import React, { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Alert, AlertDescription } from '../components/ui/alert'
import { useToast } from '../hooks/use-toast'
import { BookOpen, Info, Wand2, Loader2, ArrowLeft, Save, Sparkles, Check, X, Eye, Wallet } from 'lucide-react'
import { WorkersAPIService, DeepSeekAPIService, CozeAPIService, API_CONFIG } from '../services/api'
import { useNavigate } from 'react-router-dom'
import MarkdownRenderer from '../components/MarkdownRenderer'
import MarkdownEditor from '../components/MarkdownEditor'
import COURSE_MANAGER_ABI_DATA from '../assets/abis/CourseManager.json'
import TSK_TOKEN_ABI_DATA from '../assets/abis/TSKToken.json'
import { useWriteContract, useReadContract } from 'wagmi'

// 合约ABI
const COURSE_MANAGER_ABI = COURSE_MANAGER_ABI_DATA.abi
const TSK_TOKEN_ABI = TSK_TOKEN_ABI_DATA.abi

const CreateCoursePage: React.FC = () => {
  const { walletState, disconnectWallet } = useWallet()
  const { toast } = useToast()
  const navigate = useNavigate()

  // CourseManager合约调用hooks
  const { 
    writeContract: writeCourseManagerContract, 
    data: contractData, 
    error: contractError, 
    isPending: isContractPending 
  } = useWriteContract()

  // 读取TSK余额（主要用于刷新功能）
  const { data: _tskBalance, refetch: refetchTSKBalance } = useReadContract({
    address: API_CONFIG.TSK_TOKEN_ADDRESS as `0x${string}`,
    abi: TSK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [walletState.address as `0x${string}`],
    query: {
      enabled: !!walletState.address,
    },
  })

  const [courseData, setCourseData] = useState({
    title: '',
    content: '',
    price: '',
    description: '',
    cover: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingCover, setIsGeneratingCover] = useState(false)
  const [courseType, setCourseType] = useState<'technology' | 'business' | 'art' | 'science' | 'language' | 'other'>('other')
  
  // 课程创建流程状态
  const [pendingCourseData, setPendingCourseData] = useState<{
    courseId: string
    courseIdNumber: number
    courseData: any
  } | null>(null)

  // Stream模式相关状态
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  // 预览弹窗状态
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // 监听合约交易成功回调
  useEffect(() => {
    if (contractData && pendingCourseData) {


      // 区块链交易成功后，保存课程到Workers
      const saveCourseToWorkers = async () => {
        try {
          await WorkersAPIService.createCourse(
            walletState.address || '',
            pendingCourseData.courseId,
            pendingCourseData.courseData.content,
            pendingCourseData.courseData.title,
            parseFloat(pendingCourseData.courseData.price),
            pendingCourseData.courseData.description,
            pendingCourseData.courseData.cover,
            contractData // 使用真实的交易哈希
          )
          


          toast({
            title: "成功",
            description: "课程创建成功！区块链交易已确认，课程已保存到云端，您已获得10 TSK奖励！",
          })

          // 刷新TSK余额
          refetchTSKBalance()

          // 清理状态并跳转
          setPendingCourseData(null)
          navigate('/author')
        } catch (error) {
          console.error('保存课程到Workers失败:', error)
          toast({
            title: "错误",
            description: "区块链交易成功，但保存课程失败，请重试",
            variant: "destructive",
          })
          setPendingCourseData(null)
        } finally {
          setIsLoading(false)
        }
      }

      saveCourseToWorkers()
    }
  }, [contractData, pendingCourseData, walletState.address, toast, navigate])

  // 监听合约交易失败回调
  useEffect(() => {
    if (contractError && pendingCourseData) {
      console.error('区块链交易失败:', contractError)
      
      let errorMessage = '区块链交易失败，请重试'
      if (contractError.message.includes('User rejected')) {
        errorMessage = '用户取消了区块链交易'
      } else if (contractError.message.includes('insufficient funds')) {
        errorMessage = '账户余额不足，无法完成区块链交易'
      } else if (contractError.message.includes('gas')) {
        errorMessage = 'Gas费用不足，请检查账户余额'
      }

      toast({
        title: "交易失败",
        description: errorMessage,
        variant: "destructive",
      })

      // 清理状态
      setPendingCourseData(null)
      setIsLoading(false)
    }
  }, [contractError, pendingCourseData, toast])

  // 处理输入变化
  const handleInputChange = (field: string, value: string) => {
    setCourseData(prev => ({ ...prev, [field]: value }))
  }

  // AI生成封面图
  const handleGenerateCover = async () => {
    if (!courseData.title.trim()) {
      toast({
        title: "提示",
        description: "请先输入课程标题",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingCover(true)
    try {
      // 根据课程类型生成封面图
      const coverImageUrl = await CozeAPIService.generateTypedCoverImage(
        courseData.title,
        courseType,
        courseData.description
      )

      setCourseData(prev => ({ ...prev, cover: coverImageUrl }))

      toast({
        title: "封面图生成成功",
        description: "AI已为您的课程生成了专业的封面图！",
      })
    } catch (error) {
      console.error('生成封面图失败:', error)
      toast({
        title: "生成封面图失败",
        description: "请检查网络连接或稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingCover(false)
    }
  }



  // AI美化课程内容 - Stream模式
  const handleBeautifyContentStream = async () => {
    if (!courseData.content.trim()) {
      toast({
        title: "提示",
        description: "请先输入课程内容",
        variant: "destructive",
      })
      return
    }

    setIsStreaming(true)
    setStreamingContent('')

    try {
      await DeepSeekAPIService.beautifyCourseContentStream(
        courseData.content,
        // 处理每个数据块
        (chunk: string) => {
          setStreamingContent(prev => prev + chunk)
        },
        // 处理完成 - 不直接写入，而是保存到临时状态
        (fullContent: string) => {
          setStreamingContent(fullContent)
          setIsStreaming(false)

          toast({
            title: "AI美化完成",
            description: "请预览美化后的内容，确认无误后点击应用按钮",
          })
        },
        // 处理错误
        (error: Error) => {
          console.error('AI美化失败:', error)
          setIsStreaming(false)
          setStreamingContent('')

          toast({
            title: "AI美化失败",
            description: `请检查网络连接或稍后重试: ${error.message}`,
            variant: "destructive",
          })
        }
      )
    } catch (error) {
      console.error('启动AI美化失败:', error)
      setIsStreaming(false)
      setStreamingContent('')

      toast({
        title: "AI美化失败",
        description: "请检查网络连接或稍后重试",
        variant: "destructive",
      })
    }
  }

  // 应用AI美化结果
  const handleApplyBeautifiedContent = () => {
    if (streamingContent) {
      setCourseData(prev => ({ ...prev, content: streamingContent }))
      setStreamingContent('')
      toast({
        title: "应用成功",
        description: "AI美化内容已应用到课程中！",
      })
    }
  }

  // 取消AI美化结果
  const handleCancelBeautifiedContent = () => {
    setStreamingContent('')
    toast({
      title: "已取消",
      description: "AI美化内容已取消，保持原内容不变",
    })
  }

  // 打开预览弹窗
  const handleOpenPreview = () => {
    setShowPreviewModal(true)
  }

  // 关闭预览弹窗
  const handleClosePreview = () => {
    setShowPreviewModal(false)
  }

  // 创建课程
  const handleCreateCourse = async () => {
    if (!walletState.isConnected) {
      toast({
        title: "提示",
        description: "请先连接钱包",
        variant: "destructive",
      })
      return
    }

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
      // 生成唯一的课程ID
      const timestamp = Date.now()
      const randomNum = Math.floor(Math.random() * 1000)
      const courseId = `course-${timestamp}-${randomNum}`
      // 解析课程ID为数字（用于合约调用）
      const courseIdNumber = parseInt(courseId.replace('course-', '').split('-')[0])
      
        // 调用CourseManager合约的addBuyerToCourse函数
        // 这将把作者添加为第一个购买者，并触发TSK奖励
        const contractParams = {
          address: API_CONFIG.COURSE_MANAGER_ADDRESS as `0x${string}`,
          abi: COURSE_MANAGER_ABI,
          functionName: 'addBuyerToCourse',
          args: [courseIdNumber, walletState.address as `0x${string}`]
        }
      // 保存待处理的课程数据
      setPendingCourseData({
        courseId,
        courseIdNumber,
        courseData
      })

      // 调用合约（不等待，使用回调处理结果）
      writeCourseManagerContract(contractParams)
      


      toast({
        title: "交易已提交",
        description: "区块链交易已提交，正在等待确认...",
      })
    } catch (error) {
      console.error('创建课程失败:', error)

      let errorMessage = '创建失败，请重试'
      if (error instanceof Error) {
        errorMessage = `创建失败: ${error.message}`
      }

      toast({
        title: "错误",
        description: errorMessage,
        variant: "destructive",
      })

      // 清理状态
      setPendingCourseData(null)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和返回按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">创建新课程</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 断开连接按钮 */}
          {walletState.isConnected && (
            <Button
              variant="outline"
              onClick={disconnectWallet}
              className="flex items-center space-x-2"
            >
              <Wallet className="h-4 w-4" />
              <span>断开连接</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => navigate('/author')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回作者平台</span>
          </Button>
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

              {/* 课程类型选择 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">课程类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['technology', 'business', 'art', 'science', 'language', 'other'] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={courseType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCourseType(type)}
                      className="text-xs"
                    >
                      {type === 'technology' && '技术'}
                      {type === 'business' && '商业'}
                      {type === 'art' && '艺术'}
                      {type === 'science' && '科学'}
                      {type === 'language' && '语言'}
                      {type === 'other' && '其他'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 课程封面 */}
              <div className="space-y-2">
                <label htmlFor="cover" className="text-sm font-medium">课程封面</label>
                <div className="space-y-3">
                  {/* 封面图URL输入 */}
                  <div className="flex items-center space-x-2">
                    <Input
                      id="cover"
                      value={courseData.cover}
                      onChange={(e) => handleInputChange('cover', e.target.value)}
                      placeholder="封面图片URL（AI生成或手动输入）"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateCover}
                      disabled={isGeneratingCover || !courseData.title.trim()}
                      className="flex-1"
                    >
                      {isGeneratingCover ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          AI生成封面图
                        </>
                      )}
                    </Button>

                  </div>

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
                  使用AI生成封面图或手动输入图片URL，支持jpg、png等格式
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
                <div className="flex items-center justify-between">
                  <label htmlFor="content" className="text-sm font-medium">课程内容</label>
                  <div className="flex space-x-2">
                    {/* Stream模式AI美化按钮 */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleBeautifyContentStream}
                      disabled={isStreaming || !courseData.content.trim()}
                    >
                      {isStreaming ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          AI美化中...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          AI美化
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* 使用新的Markdown编辑器 */}
                <MarkdownEditor
                  value={courseData.content}
                  onChange={(value) => handleInputChange('content', value)}
                  placeholder="输入课程内容（支持Markdown格式）&#10;&#10;示例：&#10;# 课程标题&#10;&#10;## 第一章：基础知识&#10;&#10;- 列表项1&#10;- 列表项2&#10;&#10;**粗体文本** *斜体文本*&#10;&#10;[链接文本](https://example.com)"
                />

                {/* Stream模式实时显示 */}
                {isStreaming && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">AI正在实时美化内容...</span>
                    </div>
                    <div className="text-sm text-blue-700">
                      <div className="font-medium mb-1">实时生成内容：</div>
                      <div className="bg-white p-3 rounded border">
                        {streamingContent || '正在生成...'}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI美化结果预览和操作按钮 */}
                {!isStreaming && streamingContent && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Wand2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">AI美化完成！请预览结果</span>
                    </div>

                    <div className="text-sm text-green-700 mb-4">
                      <div className="font-medium mb-2">美化后的内容预览：</div>
                      <div className="bg-white p-3 rounded border max-h-60 overflow-y-auto">
                        <MarkdownRenderer content={streamingContent} />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={handleApplyBeautifiedContent}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        应用美化内容
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelBeautifiedContent}
                      >
                        <X className="h-4 w-4 mr-2" />
                        取消并保持原内容
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 创建按钮 */}
          <div className="flex space-x-4">
            <Button
              onClick={handleCreateCourse}
              disabled={!walletState.isConnected || isLoading || isContractPending}
              className="flex-1"
              size="lg"
            >
              {isLoading || isContractPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {isContractPending ? '等待交易确认...' : '创建中...'}
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
                <X className="h-5 w-5" />
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
                  <div className="prose prose-lg max-w-none">
                    <MarkdownRenderer content={courseData.content} />
                  </div>
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
