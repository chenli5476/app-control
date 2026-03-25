import React from 'react'
import Dashboard from '../components/Dashboard.jsx'
import DailyCheckIn from '../components/DailyCheckIn.jsx'
import AIPlantDoctor from '../components/AIPlantDoctor.jsx'
import TreeRecords from '../components/TreeRecords.jsx'
import TaskScheduler from '../components/TaskScheduler.jsx'
import Inventory from '../components/Inventory.jsx'
import Analytics from '../components/Analytics.jsx'
import MultiTenancy from '../components/MultiTenancy.jsx'
import KnowledgeBase from '../components/KnowledgeBase.jsx'
import AppFeedback from '../components/AppFeedback.jsx'
import EmergencyAlerts from '../components/EmergencyAlerts.jsx'
import RecycleBin from '../components/RecycleBin.jsx'
import AboutUs from '../components/AboutUs.jsx'
import TeamManagement from '../components/TeamManagement.jsx'
import AdminDashboard from '../components/AdminDashboard.jsx'
import Level1Dashboard from '../components/Level1Dashboard.jsx'

export const routes = [
  { path: '/', element: <Dashboard />, name: '果园概览' },
  { path: '/daily-checkin', element: <DailyCheckIn />, name: '每日打卡' },
  { path: '/ai-plant-doctor', element: <AIPlantDoctor />, name: 'AI果树医生' },
  { path: '/tree-records', element: <TreeRecords />, name: '果树档案' },
  { path: '/task-scheduler', element: <TaskScheduler />, name: '任务计划' },
  { path: '/inventory', element: <Inventory />, name: '农资库存' },
  { path: '/analytics', element: <Analytics />, name: '数据分析' },
  { path: '/multi-tenancy', element: <MultiTenancy />, name: '多果园管理' },
  { path: '/knowledge-base', element: <KnowledgeBase />, name: '知识库' },
  { path: '/app-feedback', element: <AppFeedback />, name: '问题反馈' },
  { path: '/emergency-alerts', element: <EmergencyAlerts />, name: '紧急预警' },
  { path: '/recycle-bin', element: <RecycleBin />, name: '回收站' },
  { path: '/about-us', element: <AboutUs />, name: '关于我们' },
  { path: '/team-management', element: <TeamManagement />, name: '团队管理', adminOnly: true },
]

export const adminRoutes = [
  { path: '/admin', element: <AdminDashboard />, name: '管理员后台' },
  { path: '/level1', element: <Level1Dashboard />, name: '一级管理后台' },
]

export default routes
