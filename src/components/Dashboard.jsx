import React, { useEffect } from 'react'
import { Card, Row, Col, Statistic, Button, List, Avatar, Badge, Tabs } from 'antd'
import { CheckCircleOutlined, AlertOutlined, CalendarOutlined, EnvironmentOutlined, UserOutlined, BarChartOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTask } from '../contexts/TaskContext.jsx'

const { TabPane } = Tabs

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
  const { tasks, getPendingTaskCount, getSortedTasks, toggleTaskStatus } = useTask()
  const navigate = useNavigate()
  const yieldChartRef = useRef(null)
  const pestChartRef = useRef(null)
  const taskChartRef = useRef(null)
  const dashboardData = mockDashboardData
  
  // 确保使用 tasks 来触发重新渲染
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

  // 渲染统计图表
  useEffect(() => {
    if (yieldChartRef.current) {
      const chart = echarts.init(yieldChartRef.current)
      const option = {
        title: {
          text: '产量趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '2025年',
            data: [1200, 1320, 1010, 1340, 900, 1100],
            type: 'line'
          },
          {
            name: '2026年',
            data: [1100, 1420, 1110, 1440, null, null],
            type: 'line'
          }
        ]
      }
      chart.setOption(option)
    }

    if (pestChartRef.current) {
      const chart = echarts.init(pestChartRef.current)
      const option = {
        title: {
          text: '病虫害分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '病虫害类型',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 30, name: '蚜虫' },
              { value: 20, name: '白粉病' },
              { value: 15, name: '褐斑病' },
              { value: 10, name: '红蜘蛛' },
              { value: 25, name: '其他' }
            ]
          }
        ]
      }
      chart.setOption(option)
    }

    if (taskChartRef.current) {
      const chart = echarts.init(taskChartRef.current)
      const option = {
        title: {
          text: '作业完成率',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
          type: 'value',
          max: 100
        },
        series: [
          {
            name: '完成率',
            data: [85, 92, 78, 90, null, null],
            type: 'bar'
          }
        ]
      }
      chart.setOption(option)
    }
  }, [])

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

      {/* 数据可视化 */}
      <Tabs defaultActiveKey="1" style={{ marginBottom: 24 }}>
        <TabPane tab="产量趋势" key="1">
          <div style={{ height: 400 }} ref={yieldChartRef} />
        </TabPane>
        <TabPane tab="病虫害分布" key="2">
          <div style={{ height: 400 }} ref={pestChartRef} />
        </TabPane>
        <TabPane tab="作业完成率" key="3">
          <div style={{ height: 400 }} ref={taskChartRef} />
        </TabPane>
      </Tabs>

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