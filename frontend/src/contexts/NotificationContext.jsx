import React, { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [visible, setVisible] = useState(false)

  const generateByRole = useCallback((role) => {
    const now = new Date().toLocaleString()
    
    const notificationMap = {
      superadmin: [
        { id: 1, title: '系统异常', content: '数据库连接池使用率超过80%', time: now, read: false, type: 'error', link: '/admin' },
        { id: 2, title: 'Bug反馈', content: '用户反馈任务计划页面加载缓慢', time: now, read: false, type: 'warning', link: '/app-feedback' },
        { id: 3, title: '接口异常', content: '/api/users/list 接口响应时间超过2秒', time: now, read: false, type: 'error', link: '/admin' },
        { id: 4, title: '安全警告', content: '检测到异常登录尝试', time: now, read: true, type: 'warning', link: '/admin' }
      ],
      level1: [
        { id: 1, title: '病虫害预警', content: '3号果园发现蚜虫，建议立即处理', time: now, read: false, type: 'warning', link: '/emergency-alerts' },
        { id: 2, title: '任务提醒', content: '本月施肥计划未完成', time: now, read: false, type: 'info', link: '/task-scheduler' },
        { id: 3, title: '团队动态', content: '李管理完成了今日打卡', time: now, read: true, type: 'info', link: '/daily-checkin' },
        { id: 4, title: '库存预警', content: '农药库存不足，请及时采购', time: now, read: false, type: 'warning', link: '/inventory' }
      ],
      level2: [
        { id: 1, title: '今日任务', content: '您有5个待完成任务', time: now, read: false, type: 'info', link: '/task-scheduler' },
        { id: 2, title: '天气预警', content: '明日有暴雨，请做好防护措施', time: now, read: false, type: 'warning', link: '/emergency-alerts' },
        { id: 3, title: '果树异常', content: 'A区3号果树需要浇水', time: now, read: false, type: 'warning', link: '/tree-records' },
        { id: 4, title: '系统通知', content: '新的农事日历已发布', time: now, read: true, type: 'info', link: '/knowledge-base' }
      ]
    }
    
    return notificationMap[role] || []
  }, [])

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const value = {
    notifications,
    setNotifications,
    visible,
    setVisible,
    generateByRole,
    markAsRead,
    markAllAsRead,
    unreadCount
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
