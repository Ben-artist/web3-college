import React, { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { Course } from '../types'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { useToast } from '../hooks/use-toast'
import { Plus, Edit, Trash2, BookOpen, Info, Database } from 'lucide-react'

// 模拟已创建的课程数据
const mockCreatedCourses: Course[] = [
  {
    id: '001',
    title: '课程创建 001',
    content: 'web2存储了传统相关的内容',
    price: 10,
    author: '当前用户',
    authorAddress: '0x1234567890abcdef',
    isPurchased: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: '002',
    title: '课程创建 002',
    content: 'web2存储了传统相关的内容',
    price: 15,
    author: '当前用户',
    authorAddress: '0x1234567890abcdef',
    isPurchased: false,
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 172800000,
  },
]

const AuthorPage: React.FC = () => {
  const { walletState } = useWallet()
  const { toast } = useToast()
  const [createdCourses, setCreatedCourses] = useState<Course[]>(mockCreatedCourses)
  const [newCourse, setNewCourse] = useState({
    title: '',
    content: '',
    price: '',
  })
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // 处理创建课程
  const handleCreateCourse = async () => {
    if (!walletState.isConnected) {
      toast({
        title: "提示",
        description: "请先连接钱包",
        variant: "destructive",
      })
      return
    }

    if (!newCourse.title || !newCourse.content || !newCourse.price) {
      toast({
        title: "提示",
        description: "请填写完整的课程信息",
        variant: "destructive",
      })
      return
    }

    try {
      const course: Course = {
        id: Date.now().toString(),
        title: newCourse.title,
        content: newCourse.content,
        price: parseFloat(newCourse.price),
        author: '当前用户',
        authorAddress: walletState.address || '',
        isPurchased: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      setCreatedCourses(prev => [course, ...prev])
      setNewCourse({ title: '', content: '', price: '' })
      setShowCreateDialog(false)

      toast({
        title: "成功",
        description: "课程创建成功！",
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "创建失败，请重试",
        variant: "destructive",
      })
    }
  }

  // 处理删除课程
  const handleDeleteCourse = async (courseId: string) => {
    try {
      setCreatedCourses(prev => prev.filter(course => course.id !== courseId))
      toast({
        title: "成功",
        description: "课程删除成功！",
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "删除失败，请重试",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-3">
        <BookOpen className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Web3大学 - 作者平台</h1>
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

      {/* 已创建课程 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">已创建课程</h2>
          <Button
            onClick={() => setShowCreateDialog(true)}
            disabled={!walletState.isConnected}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>创建课程</span>
          </Button>
        </div>

        <div className="grid gap-4">
          {createdCourses.map((course) => (
            <Card key={course.id} className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-3">
                  {course.content}
                </p>
                
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>价格: {course.price} TSK</span>
                  <span>创建时间: {new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 区块链存储信息 */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>区块链存储信息</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            web2存储了传统相关的内容
          </p>
          <p className="text-sm text-muted-foreground">
            web3存储了课程的ID映射关系
          </p>
          <div className="bg-muted p-3 rounded font-mono text-sm">
            <p>课程ID映射: {'{'}</p>
            {createdCourses.map((course) => (
              <p key={course.id} className="ml-4">
                {course.id}: true
              </p>
            ))}
            <p>{'}'}</p>
          </div>
        </CardContent>
      </Card>

      {/* 创建课程对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>创建新课程</DialogTitle>
            <DialogDescription>
              填写课程信息，创建新的Web3课程
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">课程标题</label>
              <Input
                id="title"
                value={newCourse.title}
                onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                placeholder="输入课程标题"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">课程内容</label>
              <Input
                id="content"
                value={newCourse.content}
                onChange={(e) => setNewCourse(prev => ({ ...prev, content: e.target.value }))}
                placeholder="输入课程内容"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="price" className="text-sm font-medium">课程价格</label>
              <Input
                id="price"
                type="number"
                value={newCourse.price}
                onChange={(e) => setNewCourse(prev => ({ ...prev, price: e.target.value }))}
                placeholder="输入课程价格"
              />
              <p className="text-xs text-muted-foreground">价格单位：TSK</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateCourse}>
              创建课程
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AuthorPage
