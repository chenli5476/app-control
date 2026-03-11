import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, Tag, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getUsers, saveUsers } from '../config/auth.js'

const TeamManagement = () => {
  const [managers, setManagers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingManager, setEditingManager] = useState(null)
  const [form] = Form.useForm()

  // 组件加载时获取当前用户和管理者列表
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
    setCurrentUser(user)
    refreshManagers()
  }, [])

  const ORCHARD_OPTIONS = [
    { value: 'xingfu', label: '幸福果园' },
    { value: 'lvse', label: '绿色果园' },
    { value: 'fengshou', label: '丰收果园' },
    { value: 'none', label: '暂无果园' }
  ]

  const refreshManagers = () => {
    const users = getUsers()
    console.log('刷新管理者列表，当前用户数据:', users)  // 调试
    setManagers(Object.entries(users).map(([account, user]) => ({
      ...user,
      account
    })))
  }

  // 权限检查：二级管理者只能编辑自己
  const canEdit = (record) => {
    if (!currentUser) return false
    if (currentUser.role === 'admin') return true
    return currentUser.id === record.id
  }

  const handleAdd = () => {
    if (currentUser?.role !== 'admin') {
      message.error('只有一级管理者可以添加用户')
      return
    }
    setEditingManager(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    if (!canEdit(record)) {
      message.error('您只能修改自己的信息')
      return
    }
    
    setEditingManager(record)
    
    // 关键修复：不要把 password 传给表单，让密码框保持为空
    const { password, ...formValues } = record
    
    form.setFieldsValue({
      ...formValues,
      orchards: record.orchards.includes('none') ? ['none'] : record.orchards
    })
    setModalVisible(true)
  }

  const handleDelete = (account) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后该管理者将无法登录系统',
      onOk: () => {
        const users = getUsers()
        delete users[account]
        saveUsers(users)
        refreshManagers()
        message.success('已删除')
      }
    })
  }

  const handleSave = (values) => {
    console.log('保存前 - 表单值:', values)  // 调试
    
    const users = getUsers()
    console.log('保存前 - 当前localStorage用户:', JSON.parse(JSON.stringify(users)))  // 调试
    
    if (editingManager) {
      // 编辑模式
      
      // 权限检查
      if (currentUser?.role === 'operator' && currentUser?.id !== editingManager.id) {
        message.error('您只能修改自己的信息')
        return
      }
      
      const oldAccount = editingManager.account
      
      // 关键修复：明确构建 userData，不使用展开运算符混合可能出问题的数据
      const userData = {
        id: editingManager.id,
        name: values.name,
        phone: values.phone,
        role: values.role,
        orchards: values.role === 'admin'
          ? ['xingfu', 'lvse', 'fengshou']
          : values.orchards
      }
      
      // 关键修复：正确处理密码
      if (values.password && values.password.trim() !== '') {
        // 用户输入了新密码
        userData.password = values.password.trim()
        console.log('使用新密码:', userData.password)  // 调试
      } else {
        // 保留原密码
        userData.password = editingManager.password
        console.log('保留原密码:', userData.password)  // 调试
      }
      
      // 如果修改了账号，删除旧账号
      if (oldAccount !== values.account) {
        delete users[oldAccount]
      }
      
      // 保存用户数据
      users[values.account] = userData
      
      console.log('保存后 - 新用户数据:', userData)  // 调试
      console.log('保存后 - 完整用户列表:', users)  // 调试
      
    } else {
      // 新增模式
      if (!values.password) {
        message.error('新增用户必须设置密码')
        return
      }
      
      users[values.account] = {
        id: Date.now().toString(),
        name: values.name,
        password: values.password,
        phone: values.phone,
        role: values.role,
        orchards: values.role === 'admin'
          ? ['xingfu', 'lvse', 'fengshou']
          : values.orchards
      }
    }
    
    // 保存到 localStorage
    saveUsers(users)
    
    // 立即验证保存是否成功
    const verifyUsers = getUsers()
    console.log('验证保存 - 从localStorage读取:', verifyUsers)  // 调试
    
    // 刷新列表
    refreshManagers()
    
    message.success('保存成功')
    setModalVisible(false)
    
    // 如果修改的是当前登录用户的密码，提示重新登录
    if (editingManager && editingManager.id === currentUser?.id && values.password) {
      message.info('密码已修改，请使用新密码重新登录')
    }
  }

  const columns = [
    { title: '姓名', dataIndex: 'name' },
    { title: '账号', dataIndex: 'account' },
    { title: '手机号', dataIndex: 'phone' },
    { 
      title: '权限等级',
      dataIndex: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '一级管理者' : '二级管理者'}
        </Tag>
      )
    },
    { 
      title: '管理果园',
      dataIndex: 'orchards',
      render: (orchards) => (
        <span>
          {orchards.includes('none')
            ? <Tag>暂无果园</Tag>
            : orchards.map(id => {
                const orchard = ORCHARD_OPTIONS.find(o => o.value === id)
                return <Tag key={id}>{orchard?.label}</Tag>
              })
          }
        </span>
      )
    },
    { 
      title: '操作',
      render: (_, record) => (
        <div>
          {canEdit(record) && (
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEdit(record)} 
              style={{ marginRight: 8 }} 
            >
              编辑
            </Button>
          )}
          {currentUser?.role === 'admin' && currentUser?.id !== record.id && (
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger 
              onClick={() => handleDelete(record.account)} 
            >
              删除
            </Button>
          )}
        </div>
      )
    }
  ]

  if (!currentUser) return null

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>团队管理</h1>
      
      <Card extra={ 
        currentUser.role === 'admin' && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加管理者
          </Button>
        )
      }>
        <Table dataSource={managers} columns={columns} rowKey="id" />
      </Card>

      <Modal 
        title={editingManager ? '编辑管理者' : '添加管理者'} 
        open={modalVisible} 
        onCancel={() => setModalVisible(false)} 
        onOk={() => form.submit()} 
        width={600} 
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          
          <Form.Item name="account" label="登录账号" rules={[{ required: true }]}>
            <Input disabled={!!editingManager} />
          </Form.Item>
          
          <Form.Item 
            name="password" 
            label={editingManager ? "新密码" : "初始密码"} 
            rules={[{ required: !editingManager, min: 3 }]} 
            extra={editingManager ? "如需修改密码请输入新密码，留空则保持原密码不变" : ""} 
          >
            <Input.Password placeholder={editingManager ? "输入新密码修改，留空则不修改" : "默认建议 123456"} />
          </Form.Item>
          
          <Form.Item name="phone" label="手机号" rules={[{ required: true, pattern: /^1\d{10}$/ }]}>
            <Input />
          </Form.Item>
          
          <Form.Item name="role" label="权限等级" rules={[{ required: true }]}>
            <Select disabled={currentUser.role === 'operator'}>
              <Select.Option value="admin">一级管理者（所有权限）</Select.Option>
              <Select.Option value="operator">二级管理者（仅指定果园）</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            name="orchards" 
            label="分配果园" 
            rules={[{ required: true, message: '请至少选择一个果园' }]} 
          >
            <Select mode="multiple" disabled={currentUser.role === 'operator'}>
              {ORCHARD_OPTIONS.map(opt => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TeamManagement