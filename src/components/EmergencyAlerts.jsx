import React, { useState, useEffect } from 'react'
import { Card, List, Badge, Tag, Button, message } from 'antd'
import { AlertOutlined, CheckCircleOutlined } from '@ant-design/icons'

const STORAGE_KEY = 'emergency_alerts'

const EmergencyAlerts = () => {
  // 从 localStorage 读取初始数据
  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        type: '病虫害',
        level: '紧急',
        title: '蚜虫高发期',
        description: '监测到果园蚜虫密度超标，建议立即喷洒杀虫剂',
        date: '2026-03-09',
        status: '未处理'
      },
      {
        id: 2,
        type: '天气',
        level: '普通',
        title: '霜冻预警',
        description: '未来48小时气温将降至0℃以下，请做好防冻措施',
        date: '2026-03-10',
        status: '未处理'
      },
      {
        id: 3,
        type: '库存',
        level: '普通',
        title: '复合肥库存不足',
        description: '当前库存仅够使用3天，请及时采购',
        date: '2026-03-08',
        status: '已处理'
      }
    ]
  })

  // 数据变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
  }, [alerts])

  const getLevelColor = (level) => {
    switch (level) {
      case '紧急': return 'red'
      case '重要': return 'orange'
      default: return 'blue'
    }
  }

  // 处理预警
  const handleProcessAlert = (id) => {
    console.log('处理预警:', id)
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, status: '已处理' } : alert
    ))
    message.success('已标记为处理')
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24, textAlign: 'center' }}>紧急预警中心</h1>
      
      <Card title="待处理预警" style={{ marginBottom: 24 }}>
        <List
          dataSource={alerts.filter(a => a.status === '未处理')}
          renderItem={item => (
            <List.Item
              actions={[
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleProcessAlert(item.id)}
                >
                  标记已处理
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    <Tag color={getLevelColor(item.level)}>{item.level}</Tag>
                    <Tag>{item.type}</Tag>
                    {item.title}
                  </span>
                }
                description={item.description}
              />
              <div style={{ color: '#999' }}>{item.date}</div>
            </List.Item>
          )}
        />
      </Card>

      <Card title="已处理预警">
        <List
          dataSource={alerts.filter(a => a.status === '已处理')}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={
                  <span style={{ textDecoration: 'line-through', color: '#999' }}>
                    <Tag>{item.type}</Tag>
                    {item.title}
                  </span>
                }
                description={item.description}
              />
              <div style={{ color: '#999' }}>{item.date}</div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default EmergencyAlerts