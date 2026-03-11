import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Dropdown, Avatar, Space, message, Select, Input, Badge, Form, Modal } from 'antd'
import { UserOutlined, TeamOutlined, LockOutlined, LogoutOutlined, SearchOutlined, BellOutlined, DownOutlined, MonitorOutlined } from '@ant-design/icons'
import { TaskProvider } from './contexts/TaskContext.jsx'
import { RecycleBinProvider } from './contexts/RecycleBinContext.jsx'
import { OrchardProvider, useOrchard } from './contexts/OrchardContext.jsx'
import { getUsers, saveUsers } from './config/auth.js'
import Dashboard from './components/Dashboard.jsx'
import DailyCheckIn from './components/DailyCheckIn.jsx'
import AIPlantDoctor from './components/AIPlantDoctor.jsx'
import AppFeedback from './components/AppFeedback.jsx'
import AboutUs from './components/AboutUs.jsx'
import TreeRecords from './components/TreeRecords.jsx'
import TaskScheduler from './components/TaskScheduler.jsx'
import Inventory from './components/Inventory.jsx'
import Analytics from './components/Analytics.jsx'
import MultiTenancy from './components/MultiTenancy.jsx'
import KnowledgeBase from './components/KnowledgeBase.jsx'
import EmergencyAlerts from './components/EmergencyAlerts.jsx'
import RecycleBin from './components/RecycleBin.jsx'
import TeamManagement from './components/TeamManagement.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import Level1Dashboard from './components/Level1Dashboard.jsx'
import Login from './components/Login.jsx'
import './App.css'

const { Header, Content, Footer } = Layout

// 果园切换组件
const OrchardSelector = () => {
  const { orchards, currentOrchard, switchOrchard } = useOrchard()
  
  return (
    <Select
      value={currentOrchard?.id}
      onChange={switchOrchard}
      style={{ width: 140, marginRight: 16 }}
      dropdownStyle={{ minWidth: 140 }}
    >
      {orchards.map(orchard => (
        <Select.Option key={orchard.id} value={orchard.id}>
          {orchard.name}
        </Select.Option>
      ))}
    </Select>
  )
}

// 导航组件
const Navigation = ({ accountMenuItems, managerName }) => {
  const location = useLocation()
  
  // 路由路径与菜单 key 的映射
  const getSelectedKey = () => {
    const path = location.pathname
    switch (path) {
      case '/': return ['1']
      case '/daily-checkin': return ['2']
      case '/ai-plant-doctor': return ['3']
      case '/tree-records': return ['4']
      case '/task-scheduler': return ['5']
      case '/inventory': return ['6']
      case '/analytics': return ['7']
      case '/multi-tenancy': return ['8']
      case '/knowledge-base': return ['9']
      case '/app-feedback': return ['10']
      case '/emergency-alerts': return ['11']
      case '/recycle-bin': return ['12']
      case '/about-us': return ['13']
      default: return ['1']
    }
  }

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={getSelectedKey()}  // 根据路由自动设置选中项
      items={[
        { key: '1', label: <Link to="/">果园概览</Link> },
        { key: '2', label: <Link to="/daily-checkin">每日打卡</Link> },
        { key: '3', label: <Link to="/ai-plant-doctor">AI 果树医生</Link> },
        { key: '4', label: <Link to="/tree-records">果树档案</Link> },
        { key: '5', label: <Link to="/task-scheduler">任务计划</Link> },
        { key: '6', label: <Link to="/inventory">农资库存</Link> },
        { key: '7', label: <Link to="/analytics">数据分析</Link> },
        { key: '8', label: <Link to="/multi-tenancy">多果园管理</Link> },
        { key: '9', label: <Link to="/knowledge-base">知识库</Link> },
        { key: '10', label: <Link to="/app-feedback">问题反馈</Link> },
        { key: '11', label: <Link to="/emergency-alerts">紧急预警</Link> },
        { key: '12', label: <Link to="/recycle-bin">回收站</Link> },
        { key: '13', label: <Link to="/about-us">关于我们</Link> },
        {
          key: '14',
          label: (
            <Dropdown menu={{ items: accountMenuItems }} trigger={['click']}>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                color: '#FFFFFF'
              }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8, backgroundColor: '#1890ff' }} />
                <span style={{ color: '#FFFFFF' }}>{managerName}</span>
              </span>
            </Dropdown>
          )
        }
      ]}
      style={{ 
        flex: 1, 
        minWidth: 0, 
        backgroundColor: 'transparent',
        fontSize: '14px'
      }}
      itemStyle={{ padding: '0 12px' }}
    />
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [managerName, setManagerName] = useState('张三')
  const [changePwdModalVisible, setChangePwdModalVisible] = useState(false)
  const [pwdForm] = Form.useForm()

  const handleLogin = (user) => {
    setIsLoggedIn(true)
    setManagerName(user.name)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  const handleChangeOwnPassword = (values) => {
    // 获取当前用户信息
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    
    // 获取所有用户数据
    const users = getUsers()
    
    // 找到当前用户的账号
    const currentAccount = Object.keys(users).find(
      key => users[key].id === currentUser.id
    )
    
    if (!currentAccount) {
      message.error('无法找到当前用户账号')
      return
    }
    
    // 验证旧密码
    if (users[currentAccount].password !== values.oldPassword) {
      message.error('旧密码错误')
      return
    }
    
    // 更新密码
    users[currentAccount].password = values.newPassword
    
    // 保存到 localStorage
    saveUsers(users)
    
    // 验证保存是否成功
    const verifyUsers = getUsers()
    console.log('密码修改后 - 从localStorage读取:', verifyUsers)
    
    message.success('密码修改成功')
    setChangePwdModalVisible(false)
    
    // 提示重新登录
    message.info('请使用新密码重新登录', 2, () => {
      handleLogout() // 退出登录
    })
  }

  // 账号管理下拉菜单
  const accountMenuItems = [
    {
      key: 'team',
      label: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          <span>团队信息</span>
        </div>
      ),
      onClick: () => message.info('团队信息功能开发中！')
    },
    {
      key: 'admin',
      label: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MonitorOutlined style={{ marginRight: 8 }} />
          <span>管理后台</span>
        </div>
      ),
      onClick: () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        if (!currentUser) {
          message.error('请先登录')
          return
        }
        
        switch (currentUser.role) {
          case 'superadmin':
            window.location.href = '/admin/dashboard'
            break
          case 'level1':
            window.location.href = '/level1/dashboard'
            break
          default:
            message.error('权限不足')
        }
      }
    },
    {
      key: 'password',
      label: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LockOutlined style={{ marginRight: 8 }} />
          <span>修改密码</span>
        </div>
      ),
      onClick: () => setChangePwdModalVisible(true)
    },
    {
      key: 'logout',
      label: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LogoutOutlined style={{ marginRight: 8 }} />
          <span>退出登录</span>
        </div>
      ),
      onClick: handleLogout
    }
  ]

  // 保护路由组件
  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />
    }
    return children
  }

// 导航组件
const Navigation = ({ accountMenuItems, managerName }) => {
  const location = useLocation()
  const currentPath = location.pathname

  // 路由与 key 的映射表
  const pathToKey = {
    '/': '1',
    '/daily-checkin': '2',
    '/ai-plant-doctor': '3',
    '/tree-records': '4',
    '/task-scheduler': '5',
    '/inventory': '6',
    '/analytics': '7',
    '/multi-tenancy': '8',
    '/knowledge-base': '9',
    '/app-feedback': '10',
    '/emergency-alerts': '11',
    '/recycle-bin': '12',
    '/about-us': '13'
  }

  // 获取当前选中的 key
  const selectedKey = pathToKey[currentPath] || '1'

  console.log('当前路径:', currentPath, '选中key:', selectedKey) // 调试用

  // 第一层菜单
  const firstLevelItems = [
    { key: '1', label: <Link to="/">果园概览</Link> },
    { key: '2', label: <Link to="/daily-checkin">每日打卡</Link> },
    { key: '3', label: <Link to="/ai-plant-doctor">AI果树医生</Link> },
  ]

  return (
    <>
      {/* 第一层导航 */}
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[selectedKey]}  // 注意是数组
        style={{ flex: 1, backgroundColor: 'transparent', borderBottom: 'none' }}
        items={firstLevelItems}
      />

      {/* 右侧操作区 */}
      <Space size={24}>
        <Input
          placeholder="搜索..."
          prefix={<SearchOutlined />}
          style={{ width: 200, backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff' }}
        />
        <Badge count={3} size="small">
          <BellOutlined style={{ color: '#fff', fontSize: 18, cursor: 'pointer' }} />
        </Badge>
        <Dropdown menu={{ items: accountMenuItems }}>
          <Space style={{ color: '#fff', cursor: 'pointer' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{managerName}</span>
            <DownOutlined style={{ fontSize: 12 }} />
          </Space>
        </Dropdown>
      </Space>
    </>
  )
}

// 第二层导航组件
const SecondLevelNavigation = () => {
  const location = useLocation()
  const currentPath = location.pathname
  const { isAdmin } = useOrchard()

  // 路由与 key 的映射表
  const pathToKey = {
    '/': '1',
    '/daily-checkin': '2',
    '/ai-plant-doctor': '3',
    '/tree-records': '4',
    '/task-scheduler': '5',
    '/inventory': '6',
    '/analytics': '7',
    '/multi-tenancy': '8',
    '/team-management': '9',
    '/knowledge-base': '10',
    '/app-feedback': '11',
    '/emergency-alerts': '12',
    '/recycle-bin': '13',
    '/about-us': '14'
  }

  // 获取当前选中的 key
  const selectedKey = pathToKey[currentPath] || '1'

  // 第二层菜单
  const secondLevelItems = [
    { key: '4', label: <Link to="/tree-records">果树档案</Link> },
    { key: '5', label: <Link to="/task-scheduler">任务计划</Link> },
    { key: '6', label: <Link to="/inventory">农资库存</Link> },
    { key: '7', label: <Link to="/analytics">数据分析</Link> },
    { key: '8', label: <Link to="/multi-tenancy">多果园管理</Link> },
    ...(isAdmin ? [{ key: '9', label: <Link to="/team-management">团队管理</Link> }] : []),
    { key: '10', label: <Link to="/knowledge-base">知识库</Link> },
    { key: '11', label: <Link to="/app-feedback">问题反馈</Link> },
    { key: '12', label: <Link to="/emergency-alerts">紧急预警</Link> },
    { key: '13', label: <Link to="/recycle-bin">回收站</Link> },
    { key: '14', label: <Link to="/about-us">关于我们</Link> },
  ]

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[selectedKey]}  // 同样的 selectedKey
      style={{ width: '100%', backgroundColor: 'transparent', borderBottom: 'none', fontSize: 14 }}
      items={secondLevelItems}
    />
  )
}

  return (
    <OrchardProvider>
      <RecycleBinProvider>
        <TaskProvider>
          <Router>
            {isLoggedIn ? (
              <Layout>
                {/* 第一层导航栏 - 深色背景 */}
                <Header style={{ 
                  backgroundColor: '#1B3A2F', 
                  height: 56, 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '0 24px', 
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {/* Logo */}
                  <div style={{ 
                    color: '#fff', 
                    fontSize: 18, 
                    fontWeight: 600, 
                    marginRight: 48, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8
                  }}>
                    🌳 果树智慧管理系统
                  </div>

                  {/* 导航组件 */}
                  <Navigation accountMenuItems={accountMenuItems} managerName={managerName} />
                </Header>

                {/* 第二层导航栏 - 稍浅背景 */}
                <div style={{ 
                  backgroundColor: '#2d4a3e',  // 比主色稍浅
                  height: 48, 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '0 24px'
                }}>
                  <SecondLevelNavigation />
                </div>

                {/* 内容区 */}
                <Content style={{ padding: 24 }}>
                  <Routes>
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/daily-checkin" element={<ProtectedRoute><DailyCheckIn /></ProtectedRoute>} />
                    <Route path="/ai-plant-doctor" element={<ProtectedRoute><AIPlantDoctor /></ProtectedRoute>} />
                    <Route path="/tree-records" element={<ProtectedRoute><TreeRecords /></ProtectedRoute>} />
                    <Route path="/task-scheduler" element={<ProtectedRoute><TaskScheduler /></ProtectedRoute>} />
                    <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                    <Route path="/multi-tenancy" element={<ProtectedRoute><MultiTenancy /></ProtectedRoute>} />
                    <Route path="/team-management" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
                    <Route path="/knowledge-base" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
                    <Route path="/app-feedback" element={<ProtectedRoute><AppFeedback /></ProtectedRoute>} />
                    <Route path="/emergency-alerts" element={<ProtectedRoute><EmergencyAlerts /></ProtectedRoute>} />
                    <Route path="/recycle-bin" element={<ProtectedRoute><RecycleBin /></ProtectedRoute>} />
                    <Route path="/about-us" element={<ProtectedRoute><AboutUs /></ProtectedRoute>} />
                    <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/level1/dashboard" element={<ProtectedRoute><Level1Dashboard /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Content>
                <Footer style={{ textAlign: 'center' }}>果树智慧管理系统 ©{new Date().getFullYear()} 版权所有</Footer>
              </Layout>
            ) : (
              <Routes>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            )}
          </Router>

          {/* 修改密码弹窗 */}
          <Modal
            title="修改密码"
            open={changePwdModalVisible}
            onCancel={() => setChangePwdModalVisible(false)}
            onOk={() => pwdForm.submit()}
          >
            <Form form={pwdForm} layout="vertical" onFinish={handleChangeOwnPassword}>
              <Form.Item name="oldPassword" label="旧密码" rules={[{ required: true }]}>
                <Input.Password />
              </Form.Item>
              <Form.Item name="newPassword" label="新密码" rules={[{ required: true, min: 3 }]}>
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="确认密码"
                rules={[
                  {
                    required: true,
                    validator: (_, value) => {
                      if (value !== pwdForm.getFieldValue('newPassword')) {
                        return Promise.reject('两次密码不一致')
                      }
                      return Promise.resolve()
                    }
                  }
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Form>
          </Modal>
        </TaskProvider>
      </RecycleBinProvider>
    </OrchardProvider>
  )
}

export default App