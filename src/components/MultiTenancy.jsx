import React, { useState, useEffect } from 'react'
import { Card, Tabs, Form, Input, Select, Table, Button, Modal, Radio, message, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useOrchard } from '../contexts/OrchardContext.jsx'
import TeamManagement from './TeamManagement.jsx'

const { Option } = Select
const { TabPane } = Tabs

// 模拟数据
const mockOrchards = [
  {
    id: 'xingfu',
    name: '幸福果园',
    location: '北京市海淀区',
    area: 50,
    treeCount: 1200,
    contact: '张三',
    phone: '13800138000'
  },
  {
    id: 'lvse',
    name: '绿色果园',
    location: '北京市昌平区',
    area: 30,
    treeCount: 800,
    contact: '李四',
    phone: '13900139000'
  },
  {
    id: 'fengshou',
    name: '丰收果园',
    location: '北京市顺义区',
    area: 45,
    treeCount: 1000,
    contact: '王五',
    phone: '13700137000'
  }
]

const mockUsers = [
  {
    id: 1,
    username: 'zhangsan',
    name: '张三',
    role: '果园主',
    orchard: '幸福果园',
    phone: '13800138000',
    status: '活跃'
  },
  {
    id: 2,
    username: 'lisi',
    name: '李四',
    role: '技术员',
    orchard: '幸福果园',
    phone: '13900139000',
    status: '活跃'
  },
  {
    id: 3,
    username: 'wangwu',
    name: '王五',
    role: '普通工人',
    orchard: '幸福果园',
    phone: '13700137000',
    status: '活跃'
  },
  {
    id: 4,
    username: 'zhaoliu',
    name: '赵六',
    role: '技术员',
    orchard: '绿色果园',
    phone: '13600136000',
    status: '活跃'
  }
]

const MultiTenancy = () => {
  const [activeTab, setActiveTab] = useState('orchards')
  const [users, setUsers] = useState(mockUsers)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingOrchard, setEditingOrchard] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()
  const context = useOrchard()
  console.log('完整context:', context)  // 看看到底有什么
  const { currentUser, switchOrchard, currentOrchardId, isAdmin } = context
  console.log('MultiTenancy isAdmin:', isAdmin)
  
  console.log('当前用户:', currentUser)  // 调试
  
  // 调试权限信息
  useEffect(() => {
    console.log('=== 权限调试 ===')
    console.log('currentUser:', currentUser)
    console.log('role:', currentUser?.role)
    console.log('isAdmin:', isAdmin)
    console.log('是否显示团队管理:', isAdmin)
  }, [currentUser, isAdmin])
  
  // 所有果园数据（带联系方式）
  const orchards = [
    { id: 'xingfu', name: '幸福果园', location: '北京市海淀区', area: 50, trees: 1200, contact: '张三', phone: '13800138000' },
    { id: 'lvse', name: '绿色果园', location: '北京市昌平区', area: 30, trees: 800, contact: '李四', phone: '13900139000' },
    { id: 'fengshou', name: '丰收果园', location: '北京市顺义区', area: 45, trees: 1000, contact: '王五', phone: '13700137000' }
  ]

  const canSwitch = (orchardId) => {
    console.log('检查权限:', {
      isAdmin,
      currentUser,
      orchardId,
      userOrchards: currentUser?.orchards
    })
    // 管理员可以切换所有，操作员只能切换自己管理的
    return isAdmin || currentUser?.orchards?.includes(orchardId)
  }

  // 提交表单
  const onFinish = (values) => {
    console.log('Received values of form:', values)
    if (activeTab === 'orchards') {
      if (editingOrchard) {
        // 编辑果园
        setOrchards(orchards.map(orchard => 
          orchard.id === editingOrchard.id ? { ...orchard, ...values } : orchard
        ))
        setEditingOrchard(null)
        message.success('编辑成功！')
      } else {
        // 添加果园
        const newOrchard = {
          id: orchards.length + 1,
          name: values.name,
          location: values.location,
          area: values.area,
          treeCount: values.treeCount,
          contact: values.contact,
          phone: values.phone
        }
        setOrchards([...orchards, newOrchard])
        message.success('添加成功！')
      }
    } else {
      if (editingUser) {
        // 编辑用户
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, ...values } : user
        ))
        setEditingUser(null)
        message.success('编辑成功！')
      } else {
        // 添加用户
        const newUser = {
          id: users.length + 1,
          username: values.username,
          name: values.name,
          role: values.role,
          orchard: values.orchard,
          phone: values.phone,
          status: '活跃'
        }
        setUsers([...users, newUser])
        message.success('添加成功！')
      }
    }
    form.resetFields()
    setModalVisible(false)
  }
  
  // 切换当前果园
  const handleSwitchOrchard = (orchardId) => {
    switchOrchard(orchardId)
    message.success(`已切换到${orchards.find(o => o.id === orchardId)?.name}`)
  }
  
  // 编辑果园
  const handleEditOrchard = (orchard) => {
    setEditingOrchard(orchard)
    form.setFieldsValue(orchard)
    setModalVisible(true)
  }
  
  // 删除果园
  const handleDeleteOrchard = (orchardId) => {
    setOrchards(orchards.filter(orchard => orchard.id !== orchardId))
    message.success('删除成功！')
  }
  
  // 编辑用户
  const handleEditUser = (user) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setModalVisible(true)
  }
  
  // 删除用户
  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId))
    message.success('删除成功！')
  }

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="果园管理" key="orchards">
          <Card title="果园管理" extra={<Button type="primary" onClick={() => setModalVisible(true)}>添加果园</Button>}>
            {currentUser?.role === 'admin' && (
              <Tag color="red" style={{ marginBottom: 16 }}>管理员模式 - 可查看所有果园</Tag>
            )}
            <Table
              dataSource={orchards}
              rowKey="id"
              columns={[
                {
                  title: '果园名称',
                  dataIndex: 'name',
                  key: 'name',
                  render: (name, record) => (
                    <span>
                      {name}
                      {record.id === currentOrchardId && <Tag color="green" style={{ marginLeft: 8 }}>当前</Tag>}
                    </span>
                  )
                },
                {
                  title: '位置',
                  dataIndex: 'location',
                  key: 'location'
                },
                {
                  title: '面积(亩)',
                  dataIndex: 'area',
                  key: 'area'
                },
                {
                  title: '果树数量',
                  dataIndex: 'trees',
                  key: 'trees'
                },
                {
                  title: '负责人',
                  dataIndex: 'contact',
                  key: 'contact'
                },
                {
                  title: '联系电话',
                  dataIndex: 'phone',
                  key: 'phone'
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => {
                    const hasPermission = canSwitch(record.id)
                    const isCurrent = record.id === currentOrchardId
                    
                    return (
                      <div>
                        <Button 
                          type={isCurrent ? 'default' : 'primary'} 
                          size="small" 
                          style={{ marginRight: 8 }}
                          disabled={isCurrent || !hasPermission}
                          onClick={() => switchOrchard(record.id)}
                        >
                          {isCurrent ? '当前果园' : hasPermission ? '切换' : '无权限'}
                        </Button>
                        {isAdmin && (
                          <>
                            <Button 
                              icon={<EditOutlined />} 
                              size="small" 
                              style={{ marginRight: 8 }}
                              onClick={() => handleEditOrchard(record)}
                            >
                              编辑
                            </Button>
                            <Button 
                              icon={<DeleteOutlined />} 
                              size="small" 
                              danger
                              onClick={() => handleDeleteOrchard(record.id)}
                            >
                              删除
                            </Button>
                          </>
                        )}
                      </div>
                    )
                  }
                }
              ]}
            />
          </Card>
        </TabPane>

        {isAdmin && (
          <>
            <TabPane tab="团队管理" key="team">
              <TeamManagement />
            </TabPane>

            <TabPane tab="角色权限" key="roles">
              <Card title="角色权限管理">
                <div style={{ padding: 24 }}>
                  <h3>角色权限说明：</h3>
                  <ul style={{ lineHeight: 2 }}>
                    <li><strong>管理员</strong>：全部权限，包括系统设置、用户管理、数据查看和导出</li>
                    <li><strong>操作员</strong>：作业记录、数据查看、果树档案管理</li>
                  </ul>
                </div>
              </Card>
            </TabPane>
          </>
        )}
      </Tabs>

      <Modal
        title={activeTab === 'orchards' ? '添加果园' : '添加用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          {activeTab === 'orchards' ? (
            <>
              <Form.Item
                name="name"
                label="果园名称"
                rules={[{ required: true, message: '请输入果园名称' }]}
              >
                <Input placeholder="例如：幸福果园" />
              </Form.Item>

              <Form.Item
                name="location"
                label="位置"
                rules={[{ required: true, message: '请输入位置' }]}
              >
                <Input placeholder="例如：北京市海淀区" />
              </Form.Item>

              <Form.Item
                name="area"
                label="面积 (亩)"
                rules={[{ required: true, message: '请输入面积' }]}
              >
                <Input type="number" placeholder="例如：50" />
              </Form.Item>

              <Form.Item
                name="treeCount"
                label="果树数量"
                rules={[{ required: true, message: '请输入果树数量' }]}
              >
                <Input type="number" placeholder="例如：1200" />
              </Form.Item>

              <Form.Item
                name="contact"
                label="联系人"
                rules={[{ required: true, message: '请输入联系人' }]}
              >
                <Input placeholder="例如：张三" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="例如：13800138000" />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="例如：zhangsan" />
              </Form.Item>

              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="例如：张三" />
              </Form.Item>

              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select style={{ width: '100%' }}>
                  <Option value="果园主">果园主</Option>
                  <Option value="技术员">技术员</Option>
                  <Option value="普通工人">普通工人</Option>
                  <Option value="观察员">观察员</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="orchard"
                label="所属果园"
                rules={[{ required: true, message: '请选择所属果园' }]}
              >
                <Select style={{ width: '100%' }}>
                  {orchards.map(orchard => (
                    <Option key={orchard.id} value={orchard.name}>{orchard.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="phone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="例如：13800138000" />
              </Form.Item>
            </>
          )}

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

export default MultiTenancy