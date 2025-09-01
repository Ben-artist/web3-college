import React from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Course } from '../types'

interface CourseCardProps {
  course: Course
  onPurchase: (courseId: string) => void
  onViewDetails: (course: Course) => void
  showPurchaseButton?: boolean
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onPurchase,
  onViewDetails,
  showPurchaseButton = true,
}) => {
  // 格式化价格显示
  const formatPrice = (price: number) => {
    return `${price} TSK`
  }

  // 格式化时间显示
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <Card
      className={`h-full relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        course.isPurchased 
          ? 'bg-green-50 border-2 border-green-500' 
          : 'bg-yellow-50 border-2 border-orange-500'
      }`}
    >
      {/* 课程状态标签 */}
      {course.isPurchased && (
        <div className="absolute -top-2 -right-2 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[20px] border-l-transparent border-r-transparent border-b-green-500 transform rotate-45" />
      )}

      <CardContent className="p-4 h-full flex flex-col">
        {/* 课程标题 */}
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          {course.title}
        </h3>

        {/* 课程描述 - 支持背景图 */}
        <div className="mb-4 flex-grow relative">
          {course.cover && (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 rounded-md"
              style={{ backgroundImage: `url(${course.cover})` }}
            />
          )}
          <p
            className={`relative text-sm text-gray-600 line-clamp-3 ${
              course.cover ? 'p-2 bg-white/80 rounded-md' : ''
            }`}
          >
            {course.description || course.content}
          </p>
        </div>

        {/* 课程信息 */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center mb-2">
            <Avatar className="w-6 h-6 text-xs mr-2">
              <AvatarFallback className="text-xs">
                {course.author.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">
              {course.author}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              创建时间: {formatDate(course.createdAt)}
            </span>
            <Badge
              variant={course.isPurchased ? "default" : "outline"}
              className={course.isPurchased ? "bg-green-500" : ""}
            >
              {formatPrice(course.price)}
            </Badge>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(course)}
            className="flex-1"
          >
            详情
          </Button>

          {showPurchaseButton && (
            course.isPurchased ? (
              <Button
                variant="default"
                size="sm"
                disabled
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                已购买
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => onPurchase(course.id)}
                className="flex-1"
              >
                购买课程
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseCard
