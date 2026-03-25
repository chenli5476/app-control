import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Input, Badge, Dropdown, Avatar, Space, Modal, message } from 'antd'
import { SearchOutlined, BellOutlined, UserOutlined, DownOutlined } from '@ant-design/icons'
import { useNotification } from '../../contexts/NotificationContext'

const Navigation = ({ accountMenuItems, managerName }) => {
  const location = useLocation()
  const currentPath = location.pathname
  const { 
    notifications, 
    visible, 
    setVisible, 
    markAsRead, 
    unreadCount 
  } = useNotification()

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

  const selectedKey = pathToKey[currentPath] || '1'

  const firstLevelItems = [
    { key: '1', label: <Link to="/">果园概览</Link> },
    { key: '2', label: <Link to="/daily-checkin">每日打卡</Link> },
    { key: '3', label: <Link to="/ai-plant-doctor">AI果树医生</Link> },
  ]

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)
    setVisible(false)
  }

  return (
    <>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[selectedKey]}
        style={{ flex: 1, backgroundColor: 'transparent', borderBottom: 'none' }}
        items={firstLevelItems}
        overflowedIndicator={null}
      />

      <Space size={24}>
        <div className="custom-search-box">
          <Input
            placeholder="搜索..."
            prefix={<SearchOutlined />}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const searchText = e.target.value
                if (searchText) {
                  message.info(`搜索: ${searchText}`)
                }
              }
            }}
          />
        </div>
        
        <Badge count={unreadCount} size="small">
          <BellOutlined 
            style={{ color: '#fff', fontSize: 18, cursor: 'pointer' }}
            onClick={() => setVisible(true)}
          />
        </Badge>
        
        <Dropdown menu={{ items: accountMenuItems }}>
          <Space style={{ color: '#fff', cursor: 'pointer' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{managerName}</span>
            <DownOutlined style={{ fontSize: 12 }} />
          </Space>
        </Dropdown>
      </Space>

      <Modal
        title="通知中心"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={500}
      >
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              暂无通知
            </div>
          ) : (
            notifications.map(notification => (
              <Link
                key={notification.id}
                to={notification.link || '#'}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: notification.read ? '#fff' : '#f6ffed',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 'bold', color: notification.type === 'error' ? '#ff4d4f' : notification.type === 'warning' ? '#faad14' : '#1890ff' }}>
                    {notification.type === 'error' ? '🔴' : notification.type === 'warning' ? '🟡' : '🔵'} {notification.title}
                  </span>
                  <span style={{ fontSize: 12, color: '#999' }}>{notification.time}</span>
                </div>
                <div style={{ color: '#666', fontSize: 14 }}>{notification.content}</div>
              </Link>
            ))
          )}
        </div>
      </Modal>
    </>
  )
}

export default Navigation
