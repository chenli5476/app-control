import React, { useState, useEffect, useRef } from 'react'
import { Card, Layout, Menu, Row, Col, Statistic, Button, Badge, Alert, Table, Tag, Space, message, Input, Modal } from 'antd'
import { UserOutlined, TeamOutlined, MonitorOutlined, AlertOutlined, LogoutOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { ROLES } from '../config/auth.js'
import { useNavigate } from 'react-router-dom'
import aiConfig from '../config/ai.config.js'
import { usersApi, authApi, systemApi } from '../services/api.js'

const { Content, Sider } = Layout

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('overview')
  const [users, setUsers] = useState([])
  const [systemStatus, setSystemStatus] = useState({
    backend: 'checking',
    api: 'checking',
    load: '0%',
    database: 'checking'
  })
  const [logs, setLogs] = useState([])
  const logIdCounter = useRef(0)
  const [banModalVisible, setBanModalVisible] = useState(false)
  const [banUsername, setBanUsername] = useState('')
  const [banReason, setBanReason] = useState('')
  const [searchUsername, setSearchUsername] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  
  const addLog = (level, message) => {
    setLogs(prev => {
      if (prev.length > 0 && prev[0].message === message && prev[0].level === level) {
        return prev
      }
      
      logIdCounter.current += 1
      
      const newLog = {
        id: logIdCounter.current,
        time: new Date().toLocaleString(),
        level: level,
        message: message
      }
      return [newLog, ...prev].slice(0, 10)
    })
  }
  
  const [apiCalls, setApiCalls] = useState(0)
  const [responseTimes, setResponseTimes] = useState([])
  const [lastResetTime, setLastResetTime] = useState(Date.now())

  const calculateSystemLoad = (responseTime) => {
    setApiCalls(prev => {
      const newCalls = prev + 1
      const now = Date.now()
      if (now - lastResetTime > 60000) {
        setLastResetTime(now)
        setResponseTimes([])
        return 0
      }
      return newCalls
    })
    
    setResponseTimes(prev => {
      const newTimes = [...prev, responseTime].slice(-10)
      const avgResponseTime = newTimes.reduce((sum, time) => sum + time, 0) / newTimes.length
      const timeLoad = Math.min(Math.max((avgResponseTime - 500) / 3500 * 100, 0), 100)
      const totalLoad = Math.round(timeLoad)
      
      setSystemStatus(prev => ({
        ...prev,
        load: `${totalLoad}%`
      }))
      
      return newTimes
    })
  }

  const checkBackendStatus = async () => {
    try {
      const startTime = Date.now()
      const response = await systemApi.getStatus()
      const responseTime = Date.now() - startTime
      calculateSystemLoad(responseTime)
      
      if (response.status === 'running') {
        const newBackendStatus = 'running'
        const newDatabaseStatus = 'connected' // 简化处理，后端服务运行即认为数据库连接正常
        
        setSystemStatus(prev => {
          // 只在状态变化时添加日志
          if (prev.backend !== newBackendStatus) {
            addLog('info', '后端服务连接成功')
          }
          if (prev.database !== newDatabaseStatus) {
            addLog('info', '数据库连接成功')
          }
          
          return {
            ...prev,
            backend: newBackendStatus,
            api: 'connected',
            database: newDatabaseStatus
          }
        })
      } else {
        setSystemStatus(prev => {
          if (prev.backend !== 'error') {
            addLog('error', '后端服务错误')
          }
          return {
            ...prev,
            backend: 'error',
            api: 'error'
          }
        })
      }
    } catch (error) {
      setSystemStatus(prev => {
        if (prev.backend !== 'stopped') {
          addLog('error', `后端服务连接失败: ${error.message}`)
        }
        return {
          ...prev,
          backend: 'stopped',
          api: 'disconnected',
          database: 'disconnected'
        }
      })
    }
  }

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authApi.getCurrentUser()
        if (response.data) {
          if (response.data.role !== ROLES.SUPER_ADMIN) {
            message.error('权限不足')
            navigate('/')
            return
          }
          loadUsers()
          addLog('info', '系统启动成功')
          checkBackendStatus()
        } else {
          message.error('获取用户信息失败')
          navigate('/')
        }
      } catch (error) {
        // 如果API失败，回退到localStorage
        const savedUser = localStorage.getItem('currentUser')
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser)
            if (user.role !== ROLES.SUPER_ADMIN) {
              message.error('权限不足')
              navigate('/')
              return
            }
            loadUsers()
            addLog('info', '系统启动成功')
            checkBackendStatus()
          } catch (e) {
            message.error('权限不足')
            navigate('/')
          }
        } else {
          message.error('权限不足')
          navigate('/')
        }
      }
    }
    
    fetchCurrentUser()
    
    const interval = setInterval(() => {
      checkBackendStatus()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [navigate])

  const loadUsers = async () => {
    try {
      const response = await usersApi.getList()
      if (response.success) {
        const userList = response.data
        
        // 为二级管理者找到所属的一级管理者
        const level1Managers = userList.filter(u => u.role === 'level1' || u.role === 'admin')
        userList.forEach(user => {
          if (user.role === 'level2' || user.role === 'operator') {
            // 找到所属的一级管理者
            const parent = level1Managers.find(l1 => 
              l1.subordinates?.includes(user.id) || 
              l1.managed_orchards?.some(orchard => user.managed_orchards?.includes(orchard))
            )
            user.parentName = parent?.name
          }
        })
        
        setUsers(userList)
      } else {
        addLog('error', `加载用户列表失败: ${response.error}`)
      }
    } catch (error) {
      addLog('error', `加载用户列表失败: ${error.message}`)
    }
  }

  const handleBanUser = async (userId, reason = null) => {
    try {
      const response = await usersApi.ban(userId, reason)
      if (response.success) {
        message.success('用户已封禁')
        loadUsers()
        addLog('warning', `封禁用户成功: ID ${userId}`)
      }
    } catch (error) {
      message.error(error.message || '封禁失败')
      addLog('error', `封禁用户失败: ${error.message}`)
    }
  }

  const handleUnbanUser = async (userId) => {
    try {
      const response = await usersApi.unban(userId)
      if (response.success) {
        message.success('用户已解封')
        loadUsers()
        addLog('info', `解封用户成功: ID ${userId}`)
      }
    } catch (error) {
      message.error(error.message || '解封失败')
      addLog('error', `解封用户失败: ${error.message}`)
    }
  }

  const handleSearchUser = async () => {
    if (!searchUsername) {
      message.warning('请输入账号、姓名或手机号')
      return
    }
    
    try {
      const user = users.find(u => 
        u.username === searchUsername || 
        u.name === searchUsername || 
        u.phone === searchUsername
      )
      if (user) {
        setSearchResult(user)
      } else {
        message.warning('未找到该用户')
        setSearchResult(null)
      }
    } catch (error) {
      message.error('查询失败')
    }
  }

  const handleQuickBan = async () => {
    if (!searchResult) {
      message.warning('请先查询用户')
      return
    }
    // 封禁原因改为选填，不需要强制输入
    
    await handleBanUser(searchResult.id, banReason || null)
    setBanModalVisible(false)
    setBanUsername('')
    setBanReason('')
    setSearchResult(null)
  }

  const menuItems = [
    { key: 'overview', icon: <UserOutlined />, label: '概览' },
    { key: 'users', icon: <TeamOutlined />, label: '用户管理' },
    { key: 'monitor', icon: <MonitorOutlined />, label: '系统监控' },
    { key: 'reports', icon: <AlertOutlined />, label: '违规处理' }
  ]

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '账号',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          {name}
          {record.role === 'level2' && record.parentName && (
            <Tag size="small" color="blue" style={{ marginLeft: 8 }}>{record.parentName}</Tag>
          )}
        </div>
      )
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color, text
        switch (role) {
          case 'superadmin':
            color = 'red'
            text = '超级管理员'
            break
          case 'level1':
            color = 'orange'
            text = '一级权限'
            break
          case 'level2':
            color = 'blue'
            text = '二级权限'
            break
          default:
            color = 'gray'
            text = '普通用户'
        }
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: '所属一级管理者',
      dataIndex: 'parentName',
      key: 'parentName',
      render: (parentName) => parentName || '-'
    },
    {
      title: '密码',
      dataIndex: 'password',
      key: 'password'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '封禁'}
        </Tag>
      )
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.role !== 'superadmin' && (
            record.status === 'active' ? (
              <Button danger size="small" onClick={() => handleBanUser(record.id, null)}>
                封禁
              </Button>
            ) : (
              <Button type="primary" size="small" onClick={() => handleUnbanUser(record.id)}>
                解封
              </Button>
            )
          )}
        </Space>
      )
    }
  ]

  const renderContent = () => {
    switch (activeMenu) {
      case 'overview':
        return (
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="总用户数" 
                  value={users.length} 
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="活跃用户" 
                  value={users.filter(u => u.status === 'active').length} 
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="封禁用户" 
                  value={users.filter(u => u.status === 'banned').length} 
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card title="系统状态">
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <Alert 
                      message="后端服务" 
                      description={`状态: ${systemStatus.backend === 'running' ? '运行中' : systemStatus.backend === 'checking' ? '检查中...' : '停止'}`}
                      type={systemStatus.backend === 'running' ? 'success' : systemStatus.backend === 'checking' ? 'info' : 'error'}
                      showIcon
                    />
                  </Col>
                  <Col span={6}>
                    <Alert 
                      message="API 连接" 
                      description={`状态: ${systemStatus.api === 'connected' ? '正常' : systemStatus.api === 'checking' ? '检查中...' : '断开'}`}
                      type={systemStatus.api === 'connected' ? 'success' : systemStatus.api === 'checking' ? 'info' : 'error'}
                      showIcon
                    />
                  </Col>
                  <Col span={6}>
                    <Alert 
                      message="数据库" 
                      description={`状态: ${systemStatus.database === 'connected' ? '已连接' : systemStatus.database === 'checking' ? '检查中...' : '断开'}`}
                      type={systemStatus.database === 'connected' ? 'success' : systemStatus.database === 'checking' ? 'info' : 'error'}
                      showIcon
                    />
                  </Col>
                  <Col span={6}>
                    <Alert 
                      message="系统负载" 
                      description={systemStatus.load}
                      type="info"
                      showIcon
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        )
      case 'users':
        return (
          <Card title="用户管理">
            <Table 
              columns={userColumns} 
              dataSource={users} 
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        )
      case 'monitor':
        return (
          <Card title="系统监控">
            <div style={{ marginBottom: 24 }}>
              <h3>后端服务状态</h3>
              <div style={{ marginLeft: 16 }}>
                <p>服务状态: <Tag color={systemStatus.backend === 'running' ? 'green' : systemStatus.backend === 'checking' ? 'blue' : 'red'}>
                  {systemStatus.backend === 'running' ? '运行中' : systemStatus.backend === 'checking' ? '检查中' : '停止'}
                </Tag></p>
                <p>数据库状态: <Tag color={systemStatus.database === 'connected' ? 'green' : systemStatus.database === 'checking' ? 'blue' : 'red'}>
                  {systemStatus.database === 'connected' ? '已连接' : systemStatus.database === 'checking' ? '检查中' : '断开'}
                </Tag></p>
                <p>最后检查: {new Date().toLocaleString()}</p>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <h3>Kimi API 状态</h3>
              <div style={{ marginLeft: 16 }}>
                <p>连接状态: <Tag color={systemStatus.api === 'connected' ? 'green' : systemStatus.api === 'checking' ? 'blue' : 'red'}>
                  {systemStatus.api === 'connected' ? '正常' : systemStatus.api === 'checking' ? '检查中' : '断开'}
                </Tag></p>
                <p>系统负载: {systemStatus.load}</p>
                <Button style={{ marginTop: 8 }} onClick={() => {
                  checkBackendStatus()
                  message.info('正在测试连接...')
                }}>测试连接</Button>
              </div>
            </div>
            <div>
              <h3>系统日志 (最近10条)</h3>
              <div style={{ marginLeft: 16 }}>
                {logs.map(log => (
                  <div key={log.id} style={{ marginBottom: 8, padding: 8, backgroundColor: log.level === 'error' ? '#fff2f0' : log.level === 'warning' ? '#fffbe6' : '#f5f5f5', borderRadius: 4 }}>
                    <p style={{ margin: 0 }}>
                      <Tag color={log.level === 'error' ? 'red' : log.level === 'warning' ? 'orange' : 'blue'}>{log.time}</Tag>
                      <span style={{ marginLeft: 16 }}>{log.message}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )
      case 'reports':
        return (
          <Card title="违规处理">
            <div style={{ marginBottom: 24 }}>
              <h3>快速封禁</h3>
              <div style={{ marginLeft: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Input 
                    placeholder="输入账号" 
                    style={{ width: 200 }} 
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                  />
                  <Button type="primary" onClick={handleSearchUser}>查询</Button>
                </div>
                {searchResult && (
                  <div style={{ padding: 16, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4, marginBottom: 16 }}>
                    <p style={{ margin: '0 0 12px 0', fontWeight: 'bold' }}>
                      找到用户: {searchResult.name} ({searchResult.username})
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Input 
                        placeholder="请输入封禁原因（选填）" 
                        style={{ width: 300 }} 
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                      />
                      <Button danger onClick={handleQuickBan}>确认封禁</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3>封禁记录</h3>
              <div style={{ marginLeft: 16 }}>
                {users.filter(u => u.status === 'banned').map(user => (
                  <div key={user.id} style={{ marginBottom: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    <p style={{ margin: 0 }}>
                      {user.username} | {user.name} | 
                      <Button type="link" size="small" onClick={() => handleUnbanUser(user.id)}>解封</Button>
                    </p>
                  </div>
                ))}
                {users.filter(u => u.status === 'banned').length === 0 && (
                  <p style={{ color: '#999' }}>暂无封禁记录</p>
                )}
              </div>
            </div>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <Layout style={{ minHeight: '80vh' }}>
      <Sider width={200} style={{ backgroundColor: '#f0f2f5' }}>
        <Menu
          mode="inline"
          selectedKeys={[activeMenu]}
          onSelect={({ key }) => setActiveMenu(key)}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      <Content style={{ padding: '24px' }}>
        <Card title="管理员后台" style={{ marginBottom: 24 }}>
          <p>欢迎使用管理员后台，您可以在这里管理用户、监控系统状态和处理违规行为。</p>
        </Card>
        {renderContent()}
      </Content>
    </Layout>
  )
}

export default AdminDashboard
