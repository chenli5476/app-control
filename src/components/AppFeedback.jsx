import React, { useState } from 'react'
import { Form, Input, Select, Upload, Button, Card, Tabs, Table, Radio, message, Modal, Descriptions } from 'antd'
import { UploadOutlined, EyeOutlined } from '@ant-design/icons'

const { TextArea } = Input
const { TabPane } = Tabs

// 模拟历史反馈数据
const mockFeedbackData = [
  {
    id: 1,
    type: 'Bug报告',
    title: '打卡功能无法上传照片',
    content: '在使用每日打卡功能时，点击上传照片按钮没有反应，无法选择照片',
    status: '已解决',
    urgent: '紧急',
    date: '2026-02-25',
    contact: '13800138000'
  },
  {
    id: 2,
    type: '功能建议',
    title: '希望增加作业计划功能',
    content: '建议增加作业计划功能，可以提前安排未来的作业任务',
    status: '处理中',
    urgent: '普通',
    date: '2026-02-20',
    contact: 'user@example.com'
  },
  {
    id: 3,
    type: '使用咨询',
    title: '如何导出打卡记录',
    content: '请问如何导出打卡记录为Excel格式？',
    status: '已回复',
    urgent: '普通',
    date: '2026-02-18',
    contact: 'wechat: user123'
  }
]

const feedbackTypes = [
  { value: 'bug', label: 'Bug报告' },
  { value: 'feature', label: '功能建议' },
  { value: 'consultation', label: '使用咨询' },
  { value: 'account', label: '账号问题' }
]

const AppFeedback = () => {
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('form')
  const [feedbackData, setFeedbackData] = useState(mockFeedbackData)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState(null)

  // 上传图片
  const uploadProps = {
    name: 'file',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`)
      }
    },
  }

  // 提交反馈
  const onFinish = (values) => {
    console.log('Received values of form:', values)
    const newFeedback = {
      id: feedbackData.length + 1,
      type: feedbackTypes.find(type => type.value === values.type).label,
      title: values.title,
      content: values.content,
      status: '已提交',
      urgent: values.urgent === 'urgent' ? '紧急' : '普通',
      date: new Date().toISOString().split('T')[0],
      contact: values.contact
    }
    setFeedbackData([...feedbackData, newFeedback])
    form.resetFields()
    message.success('反馈提交成功！')
  }
  
  // 查看详情
  const handleViewDetails = (record) => {
    setSelectedFeedback(record)
    setModalVisible(true)
  }

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="提交反馈" key="form">
          <Card title="应用问题反馈">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                name="type"
                label="反馈类型"
                rules={[{ required: true, message: '请选择反馈类型' }]}
              >
                <Select style={{ width: '100%' }}>
                  {feedbackTypes.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="title"
                label="问题标题"
                rules={[{ required: true, message: '请输入问题标题' }]}
              >
                <Input placeholder="请简要描述问题" />
              </Form.Item>

              <Form.Item
                name="content"
                label="问题描述"
                rules={[{ required: true, message: '请详细描述问题' }]}
              >
                <TextArea rows={6} placeholder="请详细描述您遇到的问题或建议" />
              </Form.Item>

              <Form.Item label="截图上传">
                <Upload {...uploadProps} listType="picture-card">
                  <Button icon={<UploadOutlined />}>上传截图</Button>
                </Upload>
              </Form.Item>

              <Form.Item
                name="contact"
                label="联系方式"
                rules={[{ required: false, message: '请输入联系方式' }]}
              >
                <Input placeholder="请留下您的电话/微信/邮箱，以便我们联系您" />
              </Form.Item>

              <Form.Item
                name="urgent"
                label="紧急程度"
                rules={[{ required: true, message: '请选择紧急程度' }]}
              >
                <Radio.Group>
                  <Radio value="normal">普通</Radio>
                  <Radio value="urgent">紧急</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                  提交反馈
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="历史反馈" key="history">
          <Card title="反馈历史记录">
            <Table
              dataSource={feedbackData}
              rowKey="id"
              columns={[
                {
                  title: 'ID',
                  dataIndex: 'id',
                  key: 'id'
                },
                {
                  title: '反馈类型',
                  dataIndex: 'type',
                  key: 'type'
                },
                {
                  title: '问题标题',
                  dataIndex: 'title',
                  key: 'title'
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => {
                    let color = ''
                    switch (status) {
                      case '已提交':
                        color = '#1890ff'
                        break
                      case '处理中':
                        color = '#faad14'
                        break
                      case '已解决':
                      case '已回复':
                        color = '#52c41a'
                        break
                      default:
                        color = '#999'
                    }
                    return <span style={{ color }}>{status}</span>
                  }
                },
                {
                  title: '紧急程度',
                  dataIndex: 'urgent',
                  key: 'urgent',
                  render: (urgent) => {
                    return <span style={{ color: urgent === '紧急' ? '#ff4d4f' : '#999' }}>{urgent}</span>
                  }
                },
                {
                  title: '提交日期',
                  dataIndex: 'date',
                  key: 'date'
                },
                {
                  title: '联系方式',
                  dataIndex: 'contact',
                  key: 'contact'
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (text, record) => (
                    <Button 
                      type="link" 
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetails(record)}
                    >
                      查看详情
                    </Button>
                  )
                }
              ]}
            />
          </Card>
        </TabPane>
      </Tabs>
      
      {/* 详情模态框 */}
      <Modal
        title="反馈详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedFeedback && (
          <Descriptions column={1}>
            <Descriptions.Item label="反馈类型">{selectedFeedback.type}</Descriptions.Item>
            <Descriptions.Item label="问题标题">{selectedFeedback.title}</Descriptions.Item>
            <Descriptions.Item label="问题描述">{selectedFeedback.content}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <span style={{ 
                color: selectedFeedback.status === '已提交' ? '#1890ff' : 
                       selectedFeedback.status === '处理中' ? '#faad14' : '#52c41a' 
              }}>
                {selectedFeedback.status}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="紧急程度">
              <span style={{ color: selectedFeedback.urgent === '紧急' ? '#ff4d4f' : '#999' }}>
                {selectedFeedback.urgent}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="提交日期">{selectedFeedback.date}</Descriptions.Item>
            <Descriptions.Item label="联系方式">{selectedFeedback.contact}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default AppFeedback