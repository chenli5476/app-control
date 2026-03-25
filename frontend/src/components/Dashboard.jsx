import React from 'react'
import { Card, Row, Col, Statistic, Button, List, Badge } from 'antd'
import { CheckCircleOutlined, CalendarOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTask } from '../contexts/TaskContext.jsx'



// 模拟数据
const mockDashboardData = {
  treeCount: 1200,
  area: 50,
  作业次数: 45,
  病虫害预警: 3,
  weather: [
    { date: '2026-02-28', condition: '晴', temperature: '20℃' },
    { date: '2026-03-01', condition: '多云', temperature: '18℃' },
    { date: '2026-03-02', condition: '阴', temperature: '16℃' }
  ],
  alerts: [
    { id: 1, title: '蚜虫高发期', level: '紧急' },
    { id: 2, title: '需浇水', level: '普通' }
  ]
}

const Dashboard = () => {
  const { getPendingTaskCount, getSortedTasks, toggleTaskStatus } = useTask()
  const navigate = useNavigate()
  const dashboardData = mockDashboardData
  
  // 确保使用 getSortedTasks() 来触发重新渲染
  const sortedTasks = getSortedTasks()
  
  // 快捷入口点击事件
  const handleQuickCheckIn = () => {
    navigate('/daily-checkin')
  }
  
  const handleTaskReminder = () => {
    navigate('/task-scheduler')
  }
  
  const handleEmergencyAlert = () => {
    navigate('/emergency-alerts')
  }
  
  const handleOrchardMap = () => {
    navigate('/multi-tenancy')
  }
  
  // 生成未来3天的天气数据
  const generateWeatherData = () => {
    const weatherData = []
    const today = new Date()
    const conditions = ['晴', '多云', '阴', '小雨']
    const temperatures = ['18℃', '20℃', '22℃', '16℃']
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateString = date.toISOString().split('T')[0]
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]
      const randomTemperature = temperatures[Math.floor(Math.random() * temperatures.length)]
      
      weatherData.push({
        date: dateString,
        condition: randomCondition,
        temperature: randomTemperature
      })
    }
    
    return weatherData
  }
  
  // 生成当前天气数据
  const weatherData = generateWeatherData()

  return (
    <div>
      <h1 style={{ marginBottom: 24, textAlign: 'center' }}>果园概览</h1>
      
      {/* 数据卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="果树总数量" value={1200} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="种植面积 (亩)" value={50} prefix={<EnvironmentOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="本月作业次数" value={45} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待办任务数" value={getPendingTaskCount()} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="天气预警（未来3天）">
            <List
              dataSource={weatherData}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.date}
                    description={`${item.condition} ${item.temperature}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="紧急预警">
            <List
              dataSource={dashboardData.alerts}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Badge color={item.level === '紧急' ? 'red' : 'orange'} text={item.title} />
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷入口 */}
      <Card title="快捷入口" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Button type="primary" block onClick={handleQuickCheckIn}>快速打卡</Button>
          </Col>
          <Col span={6}>
            <Button type="primary" block onClick={handleTaskReminder}>待办提醒</Button>
          </Col>
          <Col span={6}>
            <Button type="primary" block onClick={handleEmergencyAlert}>紧急预警</Button>
          </Col>
          <Col span={6}>
            <Button type="primary" block onClick={handleOrchardMap}>果园地图</Button>
          </Col>
        </Row>
      </Card>



      {/* 待办任务 */}
      <Card title="任务列表">
        <List
          dataSource={sortedTasks}
          renderItem={(item) => (
            <List.Item style={{ 
              opacity: item.status === '已完成' ? 0.6 : 1,
              backgroundColor: item.status === '已完成' ? '#f5f5f5' : 'transparent'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%'
              }}>
                <div style={{ 
                  flex: 1, 
                  border: '1px solid #d9d9d9', 
                  borderRadius: '4px', 
                  padding: '12px', 
                  backgroundColor: '#f9f9f9', 
                  marginRight: '12px'
                }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '4px',
                    textDecoration: item.status === '已完成' ? 'line-through' : 'none'
                  }}>{item.title}</div>
                  <div style={{ color: '#666' }}>优先级：{item.priority}</div>
                  <div style={{ color: '#666', marginTop: '4px' }}>状态：{item.status}</div>
                </div>
                <div 
                  style={{
                    border: item.status === '待办' ? '1px solid #52c41a' : '1px solid #d9d9d9',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    backgroundColor: item.status === '待办' ? '#f6ffed' : '#f5f5f5',
                    color: item.status === '待办' ? '#52c41a' : '#666',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                  onClick={() => toggleTaskStatus(item.id)}
                  title={item.status === '待办' ? "点击标记为已完成" : "点击标记为待办"}
                >
                  {item.status === '待办' ? '标记为已完成' : '标记为待办'}
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default Dashboard