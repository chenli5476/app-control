import React, { useState, useEffect } from 'react'
import { Card, Layout, Menu, Row, Col, Statistic, Button, Badge, Alert, Table, Tag, Space, message } from 'antd'
import { UserOutlined, TeamOutlined, MonitorOutlined, AlertOutlined, LogoutOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { getUsers, saveUsers, ROLES } from '../config/auth.js'
import { useNavigate } from 'react-router-dom'

const { Content, Sider } = Layout

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('overview')
  const [users, setUsers] = useState({})
  const [systemStatus, setSystemStatus] = useState({
    backend: 'running',
    api: 'connected',
    load: '23%'
  })
  const [logs, setLogs] = useState([
    { id: 1, time: '2026-03-11 15:30', level: 'error', message: '401错误 - API Key无效' },
    { id: 2, time: '2026-03-11 14:22', level: 'error', message: '500错误 - 图片解析失败' },
    { id: 3, time: '2026-03-11 13:15', level: 'info', message: '系统启动成功' }
  ])

  useEffect(() => {
    // 权限检查：只有超级管理员能访问
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    if (!currentUser || currentUser.role !== ROLES.SUPER_ADMIN) {
      message.error('权限不足')
      navigate('/')
      return
    }
    loadUsers()
  }, [navigate])

  const loadUsers = () => {
    const userData = getUsers()
    setUsers(userData)
  }

  const handleBanUser = (username) => {
    const updatedUsers = { ...users }
    if (updatedUsers[username]) {
      updatedUsers[username].status = 'banned'
      saveUsers(updatedUsers)
      setUsers(updatedUsers)
    }
  }

  const handleUnbanUser = (username) => {
    const updatedUsers = { ...users }
    if (updatedUsers[username]) {
      updatedUsers[username].status = 'active'
      saveUsers(updatedUsers)
      setUsers(updatedUsers)
    }
  }

  const menuItems = [
    { key: 'overview', icon: <UserOutlined />, label: '概览' },
    { key: 'users', icon: <TeamOutlined />, label: '用户管理' },
    { key: 'monitor', icon: <MonitorOutlined />, label: '系统监控' },
    { key: 'reports', icon: <AlertOutlined />, label: '违规处理' }
  ]

  const userColumns = [
    {
      title: '账号',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '操作员'}
        </Tag>
      )
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
          {record.status === 'active' ? (
            <Button danger size="small" onClick={() => handleBanUser(record.username)}>
              封禁
            </Button>
          ) : (
            <Button type="primary" size="small" onClick={() => handleUnbanUser(record.username)}>
              解封
            </Button>
          )}
        </Space>
      )
    }
  ]

  const userData = Object.entries(users).map(([username, user]) => ({
    key: username,
    username: username,
    role: user.role,
    status: user.status || 'active',
    phone: user.phone || ''
  }))

  const renderContent = () => {
    switch (activeMenu) {
      case 'overview':
        return (
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="总用户数" 
                  value={Object.keys(users).length} 
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="在线用户" 
                  value={3} 
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="今日新增" 
                  value={1} 
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card title="系统状态">
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Alert 
                      message="后端服务" 
                      description={`状态: ${systemStatus.backend === 'running' ? '运行中' : '停止'}`}
                      type={systemStatus.backend === 'running' ? 'success' : 'error'}
                      showIcon
                    />
                  </Col>
                  <Col span={8}>
                    <Alert 
                      message="API 连接" 
                      description={`状态: ${systemStatus.api === 'connected' ? '正常' : '断开'}`}
                      type={systemStatus.api === 'connected' ? 'success' : 'error'}
                      showIcon
                    />
                  </Col>
                  <Col span={8}>
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
              dataSource={userData} 
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
                <p>服务状态: <Tag color="green">运行中</Tag> (PID: 12345)</p>
                <p>运行时间: 2小时35分钟</p>
                <p>最后心跳: 2026-03-11 15:32:08</p>
                <Button style={{ marginTop: 8 }}>重启服务</Button>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <h3>Kimi API 状态</h3>
              <div style={{ marginLeft: 16 }}>
                <p>连接状态: <Tag color="green">正常</Tag></p>
                <p>今日调用: 156次</p>
                <p>错误次数: 2次</p>
                <p>平均响应: 1.2s</p>
                <Button style={{ marginTop: 8 }}>测试连接</Button>
              </div>
            </div>
            <div>
              <h3>错误日志 (最近10条)</h3>
              <div style={{ marginLeft: 16 }}>
                {logs.map(log => (
                  <div key={log.id} style={{ marginBottom: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    <p style={{ margin: 0 }}>
                      <Tag color={log.level === 'error' ? 'red' : 'blue'}>{log.time}</Tag>
                      <span style={{ marginLeft: 16 }}>{log.message}</span>
                    </p>
                  </div>
                ))}
                <Button style={{ marginTop: 8 }}>查看全部日志</Button>
              </div>
            </div>
          </Card>
        )
      case 'reports':
        return (
          <Card title="违规处理">
            <div style={{ marginBottom: 24 }}>
              <h3>待处理举报 (3)</h3>
              <div style={{ marginLeft: 16 }}>
                <div style={{ marginBottom: 8, padding: 8, backgroundColor: '#fff2f0', borderRadius: 4 }}>
                  <p style={{ margin: 0 }}>user123: 发布不当内容</p>
                  <Space style={{ marginTop: 8 }}>
                    <Button>查看</Button>
                    <Button danger>封禁</Button>
                  </Space>
                </div>
                <div style={{ marginBottom: 8, padding: 8, backgroundColor: '#fff2f0', borderRadius: 4 }}>
                  <p style={{ margin: 0 }}>user456: 恶意刷屏</p>
                  <Space style={{ marginTop: 8 }}>
                    <Button>查看</Button>
                    <Button>忽略</Button>
                  </Space>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <h3>快速封禁</h3>
              <div style={{ marginLeft: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="text" placeholder="输入账号" style={{ padding: 8, width: 200 }} />
                <input type="text" placeholder="封禁原因" style={{ padding: 8, width: 300 }} />
                <Button danger>确认封禁</Button>
              </div>
            </div>
            <div>
              <h3>封禁记录</h3>
              <div style={{ marginLeft: 16 }}>
                <div style={{ marginBottom: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  <p style={{ margin: 0 }}>user789 | 发布违法信息 | 永久 | 2026-03-10</p>
                </div>
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