import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
} from '@mui/material'
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
      sx={{
        height: '100%',
        position: 'relative',
        backgroundColor: course.isPurchased ? '#e8f5e8' : '#fff9c4',
        border: `2px solid ${course.isPurchased ? '#4caf50' : '#ff9800'}`,
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.3s ease',
      }}
    >
      {/* 课程状态标签 */}
      {course.isPurchased && (
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 0,
            height: 0,
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderBottom: '20px solid #4caf50',
            transform: 'rotate(45deg)',
          }}
        />
      )}

      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 课程标题 */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {course.title}
        </Typography>

        {/* 课程内容 */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {course.content}
        </Typography>

        {/* 课程信息 */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar
              sx={{ width: 24, height: 24, fontSize: '0.75rem', mr: 1 }}
            >
              {course.author.slice(0, 2)}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {course.author}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              创建时间: {formatDate(course.createdAt)}
            </Typography>
            <Chip
              label={formatPrice(course.price)}
              color={course.isPurchased ? 'success' : 'primary'}
              size="small"
              variant={course.isPurchased ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>

        {/* 操作按钮 */}
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onViewDetails(course)}
            fullWidth
          >
            详情
          </Button>

          {showPurchaseButton && (
            course.isPurchased ? (
              <Button
                variant="contained"
                size="small"
                disabled
                fullWidth
                sx={{ backgroundColor: '#4caf50' }}
              >
                已购买
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={() => onPurchase(course.id)}
                fullWidth
              >
                购买课程
              </Button>
            )
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default CourseCard
