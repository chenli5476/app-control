import React, { useState, useEffect } from 'react'
import { Form, Input, Select, DatePicker, TimePicker, Upload, Button, Card, Tabs, Table, Calendar, Statistic, Row, Col, message, Modal, Descriptions, Badge, Space, Tooltip, Timeline, Tag, Spin } from 'antd'
import { UploadOutlined, EditOutlined, HistoryOutlined, UserSwitchOutlined, ClockCircleOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { useRef } from 'react'
import { useOrchard } from '../contexts/OrchardContext'

const { Option } = Select

// 模拟数据
const mockCheckInData = [
  {
    id: 1,
    date: '2026-02-26',
    time: '09:30',
    type: '浇水灌溉',
    area: 'A区-苹果树',
    operator: {
      id: 'zhangsan',
      name: '张三',
      account: '123'
    },
    operatorHistory: [],
    details: '灌溉用水量500升，采用滴灌方式',
    weather: '晴，温度20℃，湿度60%',
    photos: [],
    createdBy: {
      id: 'zhangsan',
      name: '张三'
    },
    createdAt: '2026-02-26T09:30:00.000Z',
    updatedAt: '2026-02-26T09:30:00.000Z'
  },
  {
    id: 2,
    date: '2026-02-25',
    time: '14:00',
    type: '施肥作业',
    area: 'B区-梨树',
    operator: {
      id: 'lisi',
      name: '李四',
      account: '1234'
    },
    operatorHistory: [
      {
        timestamp: '2026-02-25T14:30:00.000Z',
        from: { id: 'zhangsan', name: '张三', account: '123' },
        to: { id: 'lisi', name: '李四', account: '1234' },
        changedBy: { id: 'zhangsan', name: '张三', account: '123' },
        reason: '临时有事，李四替班'
      }
    ],
    details: '施用复合肥10公斤，采用穴施方式',
    weather: '多云，温度18℃，湿度65%',
    photos: [],
    createdBy: {
      id: 'zhangsan',
      name: '张三'
    },
    createdAt: '2026-02-25T14:00:00.000Z',
    updatedAt: '2026-02-25T14:30:00.000Z'
  },
  {
    id: 3,
    date: '2026-02-24',
    time: '10:00',
    type: '病虫害防治',
    area: 'C区-桃树',
    operator: {
      id: 'wangwu',
      name: '王五',
      account: '12345'
    },
    operatorHistory: [],
    details: '喷洒杀虫剂，防治蚜虫，覆盖面积5亩',
    weather: '晴，温度22℃，湿度55%',
    photos: [],
    createdBy: {
      id: 'wangwu',
      name: '王五'
    },
    createdAt: '2026-02-24T10:00:00.000Z',
    updatedAt: '2026-02-24T10:00:00.000Z'
  }
]

const checkInTypes = [
  { value: 'watering', label: '浇水灌溉' },
  { value: 'fertilizing', label: '施肥作业' },
  { value: 'pruning', label: '修剪整枝' },
  { value: 'pest-control', label: '病虫害防治' },
  { value: 'harvesting', label: '采摘收获' },
  { value: 'inspection', label: '巡视检查' },
  { value: 'other', label: '其他作业' }
]

const areas = [
  { value: 'A-apple', label: 'A区-苹果树' },
  { value: 'B-pear', label: 'B区-梨树' },
  { value: 'C-peach', label: 'C区-桃树' },
  { value: 'D-grape', label: 'D区-葡萄' },
  { value: 'E-cherry', label: 'E区-樱桃' }
]

// 导入getUsers函数
import { getUsers } from '../config/auth.js'
// 导入打卡服务
import { checkInService } from '../services/checkInService.js'

// 作业人员变更记录表单组件
const CheckInForm = ({ currentUser, onSubmit }) => {
  const [form] = Form.useForm()
  const [users, setUsers] = useState([])
  const [operatorHistory, setOperatorHistory] = useState([])
  const [originalOperator, setOriginalOperator] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    // 加载所有用户（用于选择替班人员）
    const loadUsers = async () => {
      try {
        const allUsers = await getUsers()
        console.log('Current user:', currentUser)
        console.log('All users:', allUsers)
        
        // 处理 allUsers 可能是数组或对象的情况
        let userList = []
        if (Array.isArray(allUsers)) {
          // 如果是数组，直接使用
          userList = allUsers.map(user => ({
            ...user,
            account: user.username || user.id,
            label: user.name,
            value: user.username || user.id
          }))
        } else {
          // 如果是对象，使用 Object.entries
          userList = Object.entries(allUsers).map(([account, user]) => ({
            ...user,
            account,
            label: user.name,
            value: account
          }))
        }
        setUsers(userList)
        
        // 设置默认作业人员为当前登录用户
        // 优先使用 currentUser.username，如果没有则查找匹配
        let currentUserAccount = currentUser.username ||
                                  userList.find(u => u.name === currentUser.name)?.value ||
                                  userList.find(u => u.id === currentUser.id)?.value ||
                                  currentUser.id
        
        console.log('Found current user account:', currentUserAccount)
        
        const defaultOperator = {
          id: currentUser.id,
          name: currentUser.name,
          account: currentUserAccount
        }
        
        form.setFieldsValue({
          operator: currentUserAccount,
          date: dayjs(),
          time: dayjs()
        })
        
        setOriginalOperator(defaultOperator)
        setOperatorHistory([{
          type: 'create',
          timestamp: new Date().toISOString(),
          operator: defaultOperator,
          description: '创建打卡，默认作业人员'
        }])
      } catch (error) {
        console.error('加载用户列表失败:', error)
        // 使用默认用户数据
        const defaultUsers = [
          { id: 'level1_001', name: '张老板', username: 'level1_001', role: 'level1' }
        ]
        const userList = defaultUsers.map(user => ({
          ...user,
          account: user.username,
          label: user.name,
          value: user.username
        }))
        setUsers(userList)
        
        // 设置当前用户为默认作业人员
        const currentUserAccount = currentUser.username || 'level1_001'
        const defaultOperator = {
          id: currentUser.id,
          name: currentUser.name,
          account: currentUserAccount
        }
        
        form.setFieldsValue({
          operator: currentUserAccount,
          date: dayjs(),
          time: dayjs()
        })
        
        setOriginalOperator(defaultOperator)
        setOperatorHistory([{
          type: 'create',
          timestamp: new Date().toISOString(),
          operator: defaultOperator,
          description: '创建打卡，默认作业人员'
        }])
      }
    }
    
    if (currentUser) {
      loadUsers()
    }
  }, [currentUser, form])

  // 处理作业人员变更
  const handleOperatorChange = (newOperatorAccount) => {
    const newOperator = users.find(u => u.account === newOperatorAccount)
    if (!newOperator || !originalOperator) return
    
    // 如果变更为非原始人员，记录变更
    if (newOperator.account !== originalOperator.account) {
      // 先记录变更，后续在提交时验证变更原因
      const changeRecord = {
        type: 'change',
        timestamp: new Date().toISOString(),
        from: originalOperator,
        to: {
          id: newOperator.id,
          name: newOperator.name,
          account: newOperator.account
        },
        changedBy: {
          id: currentUser.id,
          name: currentUser.name
        },
        reason: '', // 变更原因在提交时从表单获取
        description: `${currentUser.name} 将作业人员从 ${originalOperator.name} 变更为 ${newOperator.name}`
      }
      
      setOperatorHistory(prev => Array.isArray(prev) ? [...prev, changeRecord] : [changeRecord])
      message.info(`作业人员已变更为：${newOperator.name}`)
    } else {
      // 改回原始人员，移除后续变更记录
      setOperatorHistory(prev => Array.isArray(prev) ? prev.filter(h => h.type === 'create') : [])
      // 清空变更原因表单字段
      form.setFieldsValue({ changeReason: undefined })
    }
  }

  // 从图片中提取EXIF时间信息
  const extractDateTimeFromImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // 尝试从文件名中提取时间信息
          const fileName = file.name
          const datePatterns = [
            /(\d{4})[-_](\d{2})[-_](\d{2})[-_](\d{2})[-_](\d{2})[-_](\d{2})/, // 2024-03-14-15-30-00
            /(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, // 20240314_153000
            /(\d{4})[-_](\d{2})[-_](\d{2})/, // 2024-03-14
            /IMG_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, // IMG_20240314_153000
            /Screenshot_(\d{4})(\d{2})(\d{2})[-_](\d{2})(\d{2})(\d{2})/, // Screenshot_20240314-153000
          ]
          
          for (const pattern of datePatterns) {
            const match = fileName.match(pattern)
            if (match) {
              const year = match[1]
              const month = match[2]
              const day = match[3]
              const hour = match[4] || '00'
              const minute = match[5] || '00'
              const second = match[6] || '00'
              
              const dateStr = `${year}-${month}-${day}`
              const timeStr = `${hour}:${minute}:${second}`
              
              const dateObj = dayjs(dateStr)
              const timeObj = dayjs(`${dateStr} ${timeStr}`)
              
              if (dateObj.isValid()) {
                resolve({ date: dateObj, time: timeObj })
                return
              }
            }
          }
          
          // 如果文件名中没有时间，使用文件的最后修改时间
          const lastModified = file.lastModified
          if (lastModified) {
            const dateObj = dayjs(lastModified)
            resolve({ date: dateObj, time: dateObj })
            return
          }
          
          resolve(null)
        }
        img.onerror = () => resolve(null)
        img.src = e.target.result
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }

  // 处理图片上传
  const handleUploadChange = async ({ fileList: newFileList }) => {
    setFileList(newFileList)
    
    // 如果上传了新图片，尝试提取时间信息
    if (newFileList.length > 0) {
      const lastFile = newFileList[newFileList.length - 1]
      if (lastFile.originFileObj) {
        const dateTime = await extractDateTimeFromImage(lastFile.originFileObj)
        if (dateTime) {
          // 自动填充日期和时间
          form.setFieldsValue({
            date: dateTime.date,
            time: dateTime.time
          })
          message.success('已从图片中提取时间信息并自动填充')
        }
      }
    }
  }

  const handleSubmit = (values) => {
    const selectedOperator = users.find(u => u.account === values.operator)
    
    // 验证变更原因：当作业人员与创建人不一致时，必须填写变更原因
    const currentUserAccount = users.find(u => u.id === currentUser.id)?.account || currentUser.id
    const isOperatorChanged = selectedOperator.account !== currentUserAccount
    
    if (isOperatorChanged && !values.changeReason?.trim()) {
      message.error('作业人员与创建人不一致时，必须填写变更原因')
      return
    }
    
    const submitData = {
      ...values,
      operator: {
        id: selectedOperator.id,
        name: selectedOperator.name,
        account: selectedOperator.account
      },
      photos: fileList.map(file => file.url || file.thumbUrl),
      operatorHistory: operatorHistory.filter(h => h.type === 'change').map(record => ({
        ...record,
        reason: values.changeReason // 使用表单中的变更原因
      })), // 只保存变更记录
      createdBy: {
        id: currentUser.id,
        name: currentUser.name
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    onSubmit(submitData)
    message.success('打卡成功')
    
    // 重置表单
    form.resetFields()
    setOperatorHistory([])
    setFileList([])
  }

  return (
    <div>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="date" label="日期" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item name="time" label="时间" rules={[{ required: true }]}>
          <TimePicker style={{ width: '100%' }} format="HH:mm" />
        </Form.Item>
        
        <Form.Item name="workType" label="作业类型" rules={[{ required: true }]}>
          <Select placeholder="选择作业类型">
            <Select.Option value="浇水">浇水</Select.Option>
            <Select.Option value="施肥">施肥</Select.Option>
            <Select.Option value="修剪">修剪</Select.Option>
            <Select.Option value="病虫害防治">病虫害防治</Select.Option>
            <Select.Option value="采摘">采摘</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item name="workArea" label="作业区域" rules={[{ required: true }]}>
          <Select placeholder="选择作业区域">
            <Select.Option value="A区">A区</Select.Option>
            <Select.Option value="B区">B区</Select.Option>
            <Select.Option value="C区">C区</Select.Option>
          </Select>
        </Form.Item>
        
        {/* 作业人员选择 - 关键功能 */}
        <Form.Item 
          name="operator" 
          label={ 
            <span> 
              作业人员 
              {operatorHistory.length > 1 && ( 
                <Tag color="orange" style={{ marginLeft: 8 }}> 
                  <UserSwitchOutlined /> 已变更 
                </Tag> 
              )} 
            </span> 
          } 
          rules={[{ required: true }]}
        >
          <Select 
            showSearch 
            placeholder="选择作业人员（默认当前登录用户）" 
            optionFilterProp="label" 
            onChange={handleOperatorChange} 
            options={users} 
          />
        </Form.Item>
        
        {/* 变更原因输入框 - 当作业人员与创建人不一致时显示 */}
        <Form.Item 
          noStyle 
          shouldUpdate={(prevValues, currentValues) => prevValues.operator !== currentValues.operator}
        >
          {({ getFieldValue }) => {
            const selectedOperatorAccount = getFieldValue('operator')
            const currentUserAccount = users.find(u => u.id === currentUser.id)?.account || currentUser.id
            const showReasonInput = selectedOperatorAccount && selectedOperatorAccount !== currentUserAccount
            
            return showReasonInput ? (
              <Form.Item label="变更原因" name="changeReason" rules={[{ required: true, message: '请填写变更原因' }]}>
                <Input.TextArea 
                  rows={2} 
                  placeholder="请填写变更原因"
                />
              </Form.Item>
            ) : null
          }}
        </Form.Item>
        
        {/* 变更记录展示 */}
        {operatorHistory.length > 1 && (
          <Form.Item label="变更记录">
            <Card size="small" style={{ background: '#fafafa' }}>
              <Timeline mode="left">
                {operatorHistory.map((record, index) => {
                  if (!record) return null
                  return (
                    <Timeline.Item
                      key={index}
                      dot={record.type === 'change' ? <EditOutlined style={{ color: '#1890ff' }} /> : <ClockCircleOutlined />}
                      color={record.type === 'change' ? 'blue' : 'green'}
                      label={record.timestamp ? dayjs(record.timestamp).format('MM-DD HH:mm:ss') : ''}
                    >
                      <div style={{ fontSize: '12px' }}>
                        {record.type === 'create' ? (
                          <span>创建：{record.operator?.name || ''}</span>
                        ) : (
                          <div>
                            <div>变更：{record.from?.name || ''} → {record.to?.name || ''}</div>
                            <div>操作人：{record.changedBy?.name || ''}</div>
                            <div>原因：{record.reason || '无'}</div>
                          </div>
                        )}
                      </div>
                    </Timeline.Item>
                  )
                })}
              </Timeline>
            </Card>
          </Form.Item>
        )}
        
        {/* 图片上传 - 支持从图片提取时间信息 */}
        <Form.Item 
          name="photos" 
          label="作业图片（支持从图片自动提取时间）" 
          rules={[{ required: true, message: '请上传作业图片' }]}
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false} // 阻止自动上传，改为本地处理
            multiple
          >
            {fileList.length >= 8 ? null : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            )}
          </Upload>
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            提交打卡
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

const DailyCheckIn = () => {
  const [activeTab, setActiveTab] = useState('form')
  const [checkInData, setCheckInData] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const chartRef = useRef(null)
  const trendRef = useRef(null)
  const [historyModalVisible, setHistoryModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  const { currentUser: contextUser } = useOrchard()
  
  // 获取打卡记录
  useEffect(() => {
    // 使用OrchardContext中的currentUser
    if (contextUser) {
      setCurrentUser(contextUser)
    }
    
    // 从API获取打卡记录
    const fetchCheckInData = async () => {
      try {
        const records = await checkInService.getAll()
        setCheckInData(records.length > 0 ? records : mockCheckInData)
      } catch (error) {
        console.error('获取打卡记录失败:', error)
        setCheckInData(mockCheckInData)
      }
    }
    
    fetchCheckInData()
  }, [contextUser])

  // 提交表单
  const onFinish = async (values) => {
    const newCheckIn = {
      id: Date.now(), // 添加唯一ID
      date: values.date.format('YYYY-MM-DD'),
      time: values.time.format('HH:mm'),
      type: values.workType,
      area: values.workArea,
      operator: values.operator,
      operatorHistory: values.operatorHistory,
      details: values.workType, // 使用作业类型作为详情
      weather: '晴，温度20℃，湿度60%', // 简化处理
      photos: values.photos || [],
      createdBy: values.createdBy,
      createdAt: values.createdAt,
      updatedAt: values.updatedAt,
      orchardId: values.orchardId // 添加果园ID
    }
    
    try {
      // 保存到数据库
      await checkInService.save(newCheckIn)
      
      // 重新获取所有记录
      const records = await checkInService.getAll()
      setCheckInData(records)
      
      message.success('打卡成功！')
    } catch (error) {
      console.error('保存打卡记录失败:', error)
      message.error('打卡失败，请重试')
    }
  }

  // 查看变更历史
  const handleViewHistory = (record) => {
    setSelectedRecord(record)
    setHistoryModalVisible(true)
  }

  // 渲染日历内容
  const dateCellRender = (value) => {
    const date = value.format('YYYY-MM-DD')
    const dayCheckIns = checkInData.filter(item => item.date === date)
    return (
      <div style={{ padding: '4px' }}>
        <div>{value.date()}</div>
        {dayCheckIns.length > 0 && (
          <div style={{ fontSize: '12px', color: '#1890ff' }}>
            {dayCheckIns.length} 条记录
          </div>
        )}
      </div>
    )
  }

  // 历史记录表格列定义
  const historyColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 100
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 80
    },
    {
      title: '作业类型',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: '作业区域',
      dataIndex: 'area',
      key: 'area'
    },
    {
      title: '作业人员',
      key: 'operator',
      render: (_, record) => (
        <span>
          {record.operator?.name}
          {record.operatorHistory?.length > 0 && (
            <Tooltip title="有变更记录">
              <Tag color="orange" style={{ marginLeft: 4 }}>
                <UserSwitchOutlined />
              </Tag>
            </Tooltip>
          )}
        </span>
      )
    },
    {
      title: '作业详情',
      dataIndex: 'details',
      key: 'details'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          icon={<HistoryOutlined />}
          onClick={() => handleViewHistory(record)}
        >
          详情
        </Button>
      )
    }
  ]

  // 统计图表
  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current)
      const typeCount = checkInData.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      }, {})

      const option = {
        title: {
          text: '本月作业类型分布',
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
            name: '作业类型',
            type: 'pie',
            radius: '50%',
            data: Object.entries(typeCount).map(([name, value]) => ({ name, value })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      chart.setOption(option)
    }

    if (trendRef.current) {
      const chart = echarts.init(trendRef.current)
      const dailyCount = checkInData.reduce((acc, item) => {
        acc[item.date] = (acc[item.date] || 0) + 1
        return acc
      }, {})

      const dates = Object.keys(dailyCount).sort()
      const counts = dates.map(date => dailyCount[date])

      const option = {
        title: {
          text: '作业量趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: dates
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: counts,
            type: 'line'
          }
        ]
      }
      chart.setOption(option)
    }
  }, [checkInData])

  const tabItems = [
    {
      key: 'form',
      label: '打卡表单',
      children: (
        <Card title="果园日常作业打卡">
          {currentUser ? (
            <CheckInForm currentUser={currentUser} onSubmit={onFinish} />
          ) : (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <p>请先登录</p>
            </div>
          )}
        </Card>
      )
    },
    {
      key: 'history',
      label: '历史记录',
      children: (
        <Card title="打卡历史记录">
          <Table
            dataSource={checkInData}
            rowKey="id"
            columns={historyColumns}
          />
        </Card>
      )
    },
    {
      key: 'calendar',
      label: '日历视图',
      children: (
        <Card title="打卡日历">
          <Calendar dateCellRender={dateCellRender} />
        </Card>
      )
    },
    {
      key: 'statistics',
      label: '统计分析',
      children: (
        <Card title="作业统计">
          <Row gutter={16}>
            <Col span={12}>
              <Statistic title="本月打卡次数" value={checkInData.length} />
            </Col>
            <Col span={12}>
              <Statistic 
                title="参与人员" 
                value={new Set(checkInData.map(item => item.operator?.id)).size} 
              />
            </Col>
          </Row>
          <div style={{ marginTop: 24, height: 300 }} ref={chartRef} />
          <div style={{ marginTop: 24, height: 300 }} ref={trendRef} />
          <Button type="primary" style={{ marginTop: 24 }}>
            导出报表
          </Button>
        </Card>
      )
    }
  ]

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      {/* 变更历史模态框 */}
      <Modal
        title="打卡详情"
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedRecord && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="日期">{selectedRecord.date}</Descriptions.Item>
              <Descriptions.Item label="时间">{selectedRecord.time}</Descriptions.Item>
              <Descriptions.Item label="作业类型">{selectedRecord.type}</Descriptions.Item>
              <Descriptions.Item label="作业区域">{selectedRecord.area}</Descriptions.Item>
              <Descriptions.Item label="当前作业人员">
                <span>
                  {selectedRecord.operator?.name} ({selectedRecord.operator?.account})
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="作业详情">{selectedRecord.details}</Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedRecord.createdBy?.name}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(selectedRecord.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            {/* 变更历史 */}
            {selectedRecord.operatorHistory?.length > 0 && (
              <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                <h4 style={{ marginTop: 0, color: '#1890ff' }}>
                  <UserSwitchOutlined /> 人员变更记录
                </h4>
                <Timeline>
                  {selectedRecord.operatorHistory.map((change, idx) => (
                    <Timeline.Item key={idx}>
                      <div style={{ fontSize: '13px' }}>
                        <div style={{ color: '#666', marginBottom: 4 }}>
                          {dayjs(change.timestamp).format('YYYY-MM-DD HH:mm:ss')} · 操作人：{change.changedBy?.name}
                        </div>
                        <div>
                          <Tag color="red">{change.from?.name}</Tag>
                          <span style={{ margin: '0 8px' }}>→</span>
                          <Tag color="green">{change.to?.name}</Tag>
                        </div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DailyCheckIn