import React, { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { Course } from '../types'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Plus, BookOpen, Eye, Edit3, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MarkdownRenderer } from '../components/MarkdownRenderer'
import { FETCH_URL } from '@/lib/constant'
import { formatAddressDisplay } from '@/lib/utils'
const AuthorPage: React.FC = () => {
  const { walletState, updateUsernameWithSignature } = useWallet()
  const [createdCourses, setCreatedCourses] = useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState('')
  const [showAutoVerifyDialog, setShowAutoVerifyDialog] = useState(false)
  const navigate = useNavigate()


  // 模拟作者创建的课程数据
  useEffect(() => {
    const loadCourses = async () => {
      if (walletState.isConnected && walletState.address) {
        setIsLoadingCourses(true)
        try {
          fetch(`${FETCH_URL}/api/getUserCourses?address=${walletState.address}`).then(res => res.json()).then(data => {
            if (data.code === 200) {
              setCreatedCourses(data.data)
            }
          })
        } catch (error) {
          console.error('加载课程失败:', error)
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

    loadCourses()
  }, [walletState.isConnected, walletState.address])

  // 预览课程
  const handlePreview = (course: Course) => {
    setPreviewCourse(course)
    setShowPreview(true)
  }

  // 关闭预览
  const handleClosePreview = () => {
    setShowPreview(false)
    setPreviewCourse(null)
  }

  // 开始编辑用户名
  const handleEditUsername = () => {
    // 总是显示当前用户名，让用户可以编辑
    const currentUsername = walletState.username || ''
    setNewUsername(currentUsername)
    setShowUsernameDialog(true)
  }

  // 保存用户名（使用签名验证）
  const handleSaveUsername = async () => {
    // 如果用户名为空，使用地址作为用户名
    const usernameToUse = newUsername.trim() || walletState.address || ''

    setIsVerifying(true)
    setVerificationMessage('')

    try {
      const result = await updateUsernameWithSignature(usernameToUse)

      if (result.success) {
        setShowUsernameDialog(false)
        setNewUsername('')
        setVerificationMessage('')
      } else {
        setVerificationMessage(result.message || '验证失败')
      }
    } catch (error) {
      console.error('验证用户名失败:', error)
      setVerificationMessage('验证失败，请重试')
    } finally {
      setIsVerifying(false)
    }
  }

  // 取消编辑用户名
  const handleCancelEditUsername = () => {
    setShowUsernameDialog(false)
    setNewUsername('')
    setVerificationMessage('')
  }


  return (
    <div className="space-y-6 mt-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Web3大学 - 作者平台</h1>
        </div>

        {/* 用户名显示和编辑 */}
        {walletState.isConnected && (
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditUsername}
              className="flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>{walletState.username}</span>
            </Button>
          </div>
        )}
      </div>

      {/* 已创建课程 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">我的课程</h2>
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
              <Card key={course.courseId} className="bg-purple-50 border-purple-200 h-96 flex flex-col">
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
                        课程ID: {course.courseId}
                      </div>

                      {/* 课程描述 */}
                      {course.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      {/* 课程内容预览 */}
                      <div className="mb-3 flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {course.content.length > 100
                            ? `${course.content.substring(0, 100)}...`
                            : course.content
                          }
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(course)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            预览
                          </Button>
                          {course.content.length > 100 && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-primary hover:text-primary/80"
                              onClick={() => navigate(`/course/${course.courseId}`)}
                            >
                              查看完整内容 →
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* 底部信息 */}
                      <div className="mt-auto space-y-2">
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>价格: {course.price} TSK</span>
                          <span>创建时间: {new Date(course.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* 购买者信息 */}
                        {course.buyers && course.buyers.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <span>购买者: {course.buyers.length} 人</span>
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

      {/* 预览模态框 */}
      {showPreview && previewCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* 模态框头部 */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <Eye className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">课程预览</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClosePreview}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            {/* 模态框内容 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* 课程信息 */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{previewCourse.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <span>课程ID: {previewCourse.courseId}</span>
                  <span>价格: {previewCourse.price} TSK</span>
                  <span>创建时间: {new Date(previewCourse.createdAt).toLocaleDateString()}</span>
                </div>
                {previewCourse.description && (
                  <p className="text-gray-600 mb-4">{previewCourse.description}</p>
                )}
              </div>

              {/* 课程封面 */}
              {previewCourse.cover && (
                <div className="mb-6">
                  <img
                    src={previewCourse.cover}
                    alt={previewCourse.title}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* 课程内容 */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-4">课程内容</h4>
                <MarkdownRenderer content={previewCourse.content} />
              </div>
            </div>

            {/* 模态框底部 */}
            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={handleClosePreview}
              >
                关闭
              </Button>
              <Button
                onClick={() => {
                  handleClosePreview()
                  navigate(`/course/${previewCourse.courseId}`)
                }}
              >
                查看完整页面
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 用户名编辑对话框 */}
      <Dialog open={showUsernameDialog} onOpenChange={(open) => {
        if (!isVerifying) {
          setShowUsernameDialog(open)
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5 text-primary" />
              <span>编辑用户名</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                用户名
              </label>
              <Input
                id="username"
                type="text"
                placeholder="请输入新的用户名"
                value={newUsername}
                onChange={(e) => {
                  setNewUsername(e.target.value)
                  setVerificationMessage('')
                }}
                maxLength={20}
                className="w-full"
                disabled={isVerifying}
              />
              <p className="text-xs text-muted-foreground">
                用户名将显示在您的课程中，最多20个字符，支持字母、数字、下划线和中文。如果留空，将使用您的钱包地址作为用户名。
              </p>

              {/* 验证消息显示 */}
              {verificationMessage && (
                <div className={`text-sm p-2 rounded ${verificationMessage.includes('成功')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                  {verificationMessage}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            {!isVerifying ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEditUsername}
                >
                  取消
                </Button>
                <Button
                  onClick={handleSaveUsername}
                >
                  保存并验证
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>正在验证中，请稍候...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 自动验证对话框 */}
      <Dialog open={showAutoVerifyDialog} onOpenChange={setShowAutoVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>用户名设置</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">
                  当前用户名: {walletState.username === walletState.address
                    ? formatAddressDisplay(walletState.username || '') + ' (地址)'
                    : walletState.username
                  }
                </p>
              </div>

              {/* 验证消息显示 */}
              {verificationMessage && (
                <div className={`text-sm p-2 rounded ${verificationMessage.includes('成功')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                  {verificationMessage}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAutoVerifyDialog(false)
                handleEditUsername()
              }}
            >
              设置新用户名
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AuthorPage