import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout, Dropdown, Avatar, Space, message, Form, Modal } from 'antd'
import { UserOutlined, LockOutlined, LogoutOutlined, BellOutlined, DownOutlined } from '@ant-design/icons'
import { TaskProvider } from './contexts/TaskContext.jsx'
import { RecycleBinProvider } from './contexts/RecycleBinContext.jsx'
import { OrchardProvider } from './contexts/OrchardContext.jsx'
import { NotificationProvider, useNotification } from './contexts/NotificationContext.jsx'
import { getUsers, saveUsers } from './config/auth.js'
import { routes } from './config/routes.jsx'
import { Navigation, SecondLevelNavigation, ProtectedRoute } from './components/layout/index.js'
import Login from './components/Login.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import './App.css'

const { Header, Content, Footer } = Layout

const SearchBox = () => (
  <div className="custom-search-box">
    <input
      type="text"
      placeholder="搜索..."
      style={{
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 4,
        padding: '4px 12px',
        color: '#fff',
        width: 200
      }}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && e.target.value) {
          message.info(`搜索: ${e.target.value}`)
        }
      }}
    />
  </div>
)

const SuperAdminHeader = ({ managerName, accountMenuItems }) => {
  const { visible, setVisible, unreadCount } = useNotification()

  return (
    <Header style={{ 
      backgroundColor: '#1B3A2F', 
      height: 56, 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0 24px', 
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
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
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 24 }}>
        <SearchBox />
        <BellOutlined 
          style={{ color: '#fff', fontSize: 18, cursor: 'pointer' }}
          onClick={() => setVisible(true)}
        />
        <Dropdown menu={{ items: accountMenuItems }}>
          <Space style={{ color: '#fff', cursor: 'pointer' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{managerName}</span>
            <DownOutlined style={{ fontSize: 12 }} />
          </Space>
        </Dropdown>
      </div>
    </Header>
  )
}

const AppContent = ({ 
  isLoggedIn, 
  currentUser, 
  managerName, 
  accountMenuItems,
  changePwdModalVisible,
  setChangePwdModalVisible,
  pwdForm,
  handleChangeOwnPassword,
  onLogin
}) => {
  const { setNotifications, generateByRole } = useNotification()

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const roleNotifications = generateByRole(currentUser.role)
      setNotifications(roleNotifications)
    }
  }, [isLoggedIn, currentUser, generateByRole, setNotifications])

  const isSuperAdmin = currentUser?.role === 'superadmin'

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (isSuperAdmin) {
    return (
      <Layout>
        <SuperAdminHeader managerName={managerName} accountMenuItems={accountMenuItems} />
        <Content style={{ padding: 24, minHeight: '80vh' }}>
          <AdminDashboard />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          果树智慧管理系统 ©{new Date().getFullYear()} 版权所有
        </Footer>
      </Layout>
    )
  }

  return (
    <Layout>
      <Header style={{ 
        backgroundColor: '#1B3A2F', 
        height: 56, 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 24px', 
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
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
        <Navigation accountMenuItems={accountMenuItems} managerName={managerName} />
      </Header>
      <div style={{ 
        backgroundColor: '#2d4a3e', 
        height: 48, 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 24px',
        overflowX: 'auto',
        overflowY: 'hidden'
      }}>
        <SecondLevelNavigation />
      </div>
      <Content style={{ padding: 24 }}>
        <Routes>
          {routes.map(route => (
            <Route 
              key={route.path}
              path={route.path} 
              element={<ProtectedRoute isLoggedIn={isLoggedIn}>{route.element}</ProtectedRoute>} 
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        果树智慧管理系统 ©{new Date().getFullYear()} 版权所有
      </Footer>
    </Layout>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [managerName, setManagerName] = useState('张三')
  const [currentUser, setCurrentUser] = useState(null)
  const [changePwdModalVisible, setChangePwdModalVisible] = useState(false)
  const [pwdForm] = Form.useForm()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { authApi } = await import('./services/api.js')
        const response = await authApi.getCurrentUser()
        if (response.data) {
          setCurrentUser(response.data)
          setManagerName(response.data.name)
          setIsLoggedIn(true)
        }
      } catch (error) {
        console.error('获取当前用户失败:', error)
        // 清除本地存储的登录状态
        localStorage.removeItem('auth_token')
        localStorage.removeItem('currentUser')
        setIsLoggedIn(false)
        setCurrentUser(null)
      }
    }
    
    checkAuthStatus()
  }, [])

  const handleLogin = (user) => {
    setIsLoggedIn(true)
    setManagerName(user.name)
    setCurrentUser(user)
    // localStorage操作已在api.js的login方法中处理
  }

  const handleLogout = async () => {
    try {
      const { authApi } = await import('./services/api.js')
      await authApi.logout()
    } catch (error) {
      console.error('登出失败:', error)
    }
    setIsLoggedIn(false)
    setCurrentUser(null)
    // localStorage操作已在api.js的logout方法中处理
  }

  const handleChangeOwnPassword = async (values) => {
    if (!currentUser) {
      message.error('无法找到当前用户账号')
      return
    }
    
    try {
      const { authApi } = await import('./services/api.js')
      await authApi.changePassword(values.oldPassword, values.newPassword)
      
      message.success('密码修改成功')
      setChangePwdModalVisible(false)
      message.info('请使用新密码重新登录', 2, handleLogout)
    } catch (error) {
      console.error('修改密码失败:', error)
      message.error(error.message || '修改密码失败，请重试')
    }
  }

  const accountMenuItems = [
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

  return (
    <OrchardProvider>
      <RecycleBinProvider>
        <TaskProvider>
          <NotificationProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppContent 
                isLoggedIn={isLoggedIn}
                currentUser={currentUser}
                managerName={managerName}
                accountMenuItems={accountMenuItems}
                changePwdModalVisible={changePwdModalVisible}
                setChangePwdModalVisible={setChangePwdModalVisible}
                pwdForm={pwdForm}
                handleChangeOwnPassword={handleChangeOwnPassword}
                onLogin={handleLogin}
              />
              <Modal
                title="修改密码"
                open={changePwdModalVisible}
                onCancel={() => setChangePwdModalVisible(false)}
                footer={null}
              >
                <Form form={pwdForm} layout="vertical" onFinish={handleChangeOwnPassword}>
                  <Form.Item label="旧密码" name="oldPassword" rules={[{ required: true, message: '请输入旧密码' }]}>
                    <input type="password" style={{ width: '100%', padding: '8px 12px' }} />
                  </Form.Item>
                  <Form.Item label="新密码" name="newPassword" rules={[{ required: true, message: '请输入新密码' }]}>
                    <input type="password" style={{ width: '100%', padding: '8px 12px' }} />
                  </Form.Item>
                  <Form.Item
                    label="确认新密码"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: '请确认新密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error('两次输入的密码不一致'))
                        },
                      }),
                    ]}
                  >
                    <input type="password" style={{ width: '100%', padding: '8px 12px' }} />
                  </Form.Item>
                  <Form.Item>
                    <button type="submit" style={{ width: '100%', padding: '8px 16px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                      确认修改
                    </button>
                  </Form.Item>
                </Form>
              </Modal>
            </Router>
          </NotificationProvider>
        </TaskProvider>
      </RecycleBinProvider>
    </OrchardProvider>
  )
}

export default App
