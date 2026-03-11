import React, { useState, useEffect } from 'react'
import { Card, Layout, Menu, Row, Col, Statistic, Button, Table, Tag, Space, message } from 'antd'
import { UserOutlined, TeamOutlined, MonitorOutlined, AlertOutlined, LogoutOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { getUsers, saveUsers, ROLES } from '../config/auth.js'
import { useNavigate } from 'react-router-dom'

const { Content, Sider } = Layout

const Level1Dashboard = () => {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('overview')
  const [currentUser, setCurrentUser] = useState(null)
  const [subordinates, setSubordinates] = useState([])
  const [systemStatus, setSystemStatus] = useState({
    backend: 'running',
    api: 'connected',
    load: '23%'
  })

  useEffect(() => {
    // 权限检查：只有一级权限能访问
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user || user.role !== ROLES.LEVEL_1) {
      message.error('权限不足')
      navigate('/')
      return
    }
    setCurrentUser(user)
    loadSubordinates(user.id)
  }, [navigate])

  const loadSubordinates = (userId) => {
    const users = getUsers()
    const user = Object.values(users).find(u => u.id === userId)
    if (user && user.subordinates) {
      const subs = user.subordinates.map(subId => users[subId]).filter(Boolean)
      setSubordinates(subs)
    }
  }

  const menuItems = [
    { key: 'overview', icon: <UserOutlined />, label: '概览' },
    { key: 'subordinates', icon: <TeamOutlined />, label: '我的管理者' },
    { key: 'orchards', icon: <MonitorOutlined />, label: '我的果园' }
  ]

  const subordinateColumns = [
    {
      title: '账号',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color="blue">
          {role === ROLES.LEVEL_2 ? '果园管理者' : '未知'}
        </Tag>
      )
    },
    {
      title: '管理果园',
      dataIndex: 'managedOrchards',
      key: 'managedOrchards',
      render: (orchards) => (
        <span>{orchards?.join(', ') || '无'}</span>
      )
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone'
    }
  ]

  const renderContent = () => {
    if (!currentUser) return null

    switch (activeMenu) {
      case 'overview':
        return (
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="我的管理者数量" 
                  value={subordinates.length} 
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="管理果园数量" 
                  value={currentUser.managedOrchards?.length || 0} 
                  prefix={<MonitorOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="系统状态" 
                  value="正常" 
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card title="个人信息">
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <p><strong>账号：</strong>{currentUser.username}</p>
                    <p><strong>姓名：</strong>{currentUser.name}</p>
                  </Col>
                  <Col span={8}>
                    <p><strong>角色：</strong>一级权限（大老板）</p>
                    <p><strong>手机号：</strong>{currentUser.phone || '未设置'}</p>
                  </Col>
                  <Col span={8}>
                    <p><strong>管理果园：</strong>{currentUser.managedOrchards?.join(', ') || '无'}</p>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        )
      case 'subordinates':
        return (
          <Card title="我的管理者">
            <Table 
              columns={subordinateColumns} 
              dataSource={subordinates.map(sub => ({
                ...sub,
                key: sub.id,
                username: sub.id
              }))} 
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: '暂无下属管理者' }}
            />
          </Card>
        )
      case 'orchards':
        return (
          <Card title="我的果园">
            <div style={{ padding: 16 }}>
              {currentUser.managedOrchards?.map((orchard, index) => (
                <Card key={index} style={{ marginBottom: 16 }}>
                  <Row>
                    <Col span={8}>
                      <p><strong>果园名称：</strong>{orchard}</p>
                    </Col>
                    <Col span={8}>
                      <p><strong>状态：</strong><Tag color="green">正常</Tag></p>
                    </Col>
                    <Col span={8}>
                      <Button type="primary" style={{ marginRight: 8 }}>查看详情</Button>
                      <Button>管理</Button>
                    </Col>
                  </Row>
                </Card>
              )) || (
                <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
                  暂无管理的果园
                </div>
              )}
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
        <Card title="一级权限管理后台" style={{ marginBottom: 24 }}>
          <p>欢迎使用一级权限管理后台，您可以管理您的果园和下属管理者。</p>
        </Card>
        {renderContent()}
      </Content>
    </Layout>
  )
}

export default Level1Dashboard