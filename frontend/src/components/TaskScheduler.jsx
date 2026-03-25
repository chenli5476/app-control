import React, { useState } from 'react'
import { Card, Tabs, Form, Input, Select, DatePicker, Table, Button, Modal, Radio, Checkbox, message } from 'antd'
import { EditOutlined, DeleteOutlined, CalendarOutlined, BellOutlined } from '@ant-design/icons'
import { useTask } from '../contexts/TaskContext.jsx'
import { useRecycleBin } from '../contexts/RecycleBinContext.jsx'
import { useOrchard } from '../contexts/OrchardContext.jsx'
import dayjs from 'dayjs'

const { Option } = Select
const { RangePicker } = DatePicker

const TaskScheduler = () => {
  const [activeTab, setActiveTab] = useState('tasks')
  const { getSortedTasks, toggleTaskStatus, addTask, deleteTask, editTask } = useTask()
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingTask, setEditingTask] = useState(null)
  const { moveToRecycleBin } = useRecycleBin()
  const { currentOrchard } = useOrchard()

  // 提交表单
  const onFinish = (values) => {
    const taskData = {
      title: values.title,
      type: values.type,
      priority: values.priority,
      assignee: values.assignee,
      startDate: values.dateRange[0].format('YYYY-MM-DD'),
      endDate: values.dateRange[1].format('YYYY-MM-DD'),
      description: values.description,
      materials: values.materials
    }
    
    if (editingTask) {
      // 编辑现有任务
      editTask(editingTask.id, taskData)
      form.resetFields()
      setModalVisible(false)
      setEditingTask(null)
      message.success('任务编辑成功！')
    } else {
      // 添加新任务
      const newTask = {
        ...taskData,
        id: Date.now(), // 使用时间戳作为唯一 ID
        status: '待办'
      }
      addTask(newTask)
      form.resetFields()
      setModalVisible(false)
      message.success('任务添加成功！')
    }
  }



  // 键盘快捷键支持
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // 按空格键切换选中任务的状态
      if (e.code === 'Space') {
        // 这里可以添加选中任务的逻辑，暂时省略
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const tabsItems = [
    {
      key: 'tasks',
      label: '任务管理',
      children: (
        <Card title={`${currentOrchard?.name || '默认果园'} - 任务管理`} extra={<Button type="primary" onClick={() => setModalVisible(true)}>添加任务</Button>}>
          <Table
            dataSource={getSortedTasks()}
            rowKey="id"
            columns={[
              {
                title: '任务名称',
                dataIndex: 'title',
                key: 'title'
              },
              {
                title: '任务类型',
                dataIndex: 'type',
                key: 'type'
              },
              {
                title: '优先级',
                dataIndex: 'priority',
                key: 'priority',
                render: (priority) => {
                  let color = ''
                  switch (priority) {
                    case '高':
                      color = 'red'
                      break
                    case '中':
                      color = 'orange'
                      break
                    case '低':
                      color = 'green'
                      break
                    default:
                      color = 'black'
                  }
                  return <span style={{ color }}>{priority}</span>
                }
              },
              {
                title: '负责人',
                dataIndex: 'assignee',
                key: 'assignee'
              },
              {
                title: '开始日期',
                dataIndex: 'startDate',
                key: 'startDate'
              },
              {
                title: '结束日期',
                dataIndex: 'endDate',
                key: 'endDate'
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: (status, record) => {
                  let color = ''
                  switch (status) {
                    case '待办':
                      color = 'orange'
                      break
                    case '已完成':
                      color = 'green'
                      break
                    default:
                      color = 'black'
                  }
                  return (
                    <span 
                      style={{ color, cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => toggleTaskStatus(record.id)}
                      title="点击切换状态"
                    >
                      {status}
                    </span>
                  )
                }
              },
              {
                title: '操作',
                key: 'action',
                render: (_, record) => (
                  <div>
                    <Button 
                      type={record.status === '已完成' ? 'default' : 'primary'} 
                      size="small" 
                      style={{ marginRight: 8 }} 
                      onClick={() => toggleTaskStatus(record.id)}
                    >
                      {record.status === '已完成' ? '标记为待办' : '标记为已完成'}
                    </Button>
                    <Button 
                      icon={<EditOutlined />} 
                      size="small" 
                      style={{ marginRight: 8 }} 
                      onClick={() => {
                        // 打开编辑弹窗，填充当前数据
                        setEditingTask(record)
                        form.setFieldsValue({
                          title: record.title,
                          type: record.type,
                          priority: record.priority,
                          assignee: record.assignee,
                          dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
                          description: record.description,
                          materials: record.materials
                        })
                        setModalVisible(true)
                      }}
                    >
                      编辑
                    </Button>
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger 
                      onClick={() => {
                        Modal.confirm({
                          title: '确认删除',
                          content: `确定要删除任务"${record.title}"吗？`,
                          onOk: () => {
                            moveToRecycleBin(record, 'task')
                            deleteTask(record.id)
                          }
                        })
                      }}
                    >
                      删除
                    </Button>
                  </div>
                )
              }
            ]}
          />
        </Card>
      )
    },
    {
      key: 'calendar',
      label: '计划日历',
      children: (
        <Card title="计划日历">
          <div style={{ height: 500, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>日历视图开发中...</p>
          </div>
        </Card>
      )
    },
    {
      key: 'reminders',
      label: '提醒设置',
      children: (
        <Card title="提醒设置">
          <Form layout="vertical">
            <Form.Item label="提醒方式">
              <Checkbox.Group>
                <Checkbox value="app">APP推送</Checkbox>
                <Checkbox value="wechat">微信提醒</Checkbox>
                <Checkbox value="sms">短信提醒</Checkbox>
                <Checkbox value="email">邮件提醒</Checkbox>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item label="提醒时间">
              <Radio.Group>
                <Radio value="day">提前1天</Radio>
                <Radio value="hour">提前4小时</Radio>
                <Radio value="half">提前30分钟</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item>
              <Button type="primary" style={{ width: '100%' }}>
                保存设置
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )
    }
  ]

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabsItems} />

      <Modal
        title={editingTask ? "编辑任务" : "添加任务"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="title"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="例如：苹果树施肥" />
          </Form.Item>

          <Form.Item
            name="type"
            label="任务类型"
            rules={[{ required: true, message: '请选择任务类型' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="周期性任务">周期性任务</Option>
              <Option value="季节性任务">季节性任务</Option>
              <Option value="自定义任务">自定义任务</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="高">高</Option>
              <Option value="中">中</Option>
              <Option value="低">低</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="assignee"
            label="负责人"
            rules={[{ required: true, message: '请选择负责人' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="张三">张三</Option>
              <Option value="李四">李四</Option>
              <Option value="王五">王五</Option>
              <Option value="赵六">赵六</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="任务时间"
            rules={[{ required: true, message: '请选择任务时间' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
            rules={[{ required: true, message: '请输入任务描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请详细描述任务内容" />
          </Form.Item>

          <Form.Item
            name="materials"
            label="所需物资"
            rules={[{ required: true, message: '请选择所需物资' }]}
          >
            <Select mode="multiple" style={{ width: '100%' }}>
              <Option value="复合肥">复合肥</Option>
              <Option value="杀虫剂">杀虫剂</Option>
              <Option value="杀菌剂">杀菌剂</Option>
              <Option value="修剪工具">修剪工具</Option>
              <Option value="喷雾器">喷雾器</Option>
              <Option value="防护装备">防护装备</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TaskScheduler