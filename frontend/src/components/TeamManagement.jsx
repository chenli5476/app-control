import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, Tag, message, Space, Dropdown, Menu, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'
import { usersApi, authApi } from '../services/api.js'
import { useOrchard } from '../contexts/OrchardContext'

const TeamManagement = () => {
  const [managers, setManagers] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingManager, setEditingManager] = useState(null)
  const [form] = Form.useForm()
  const [expandedRows, setExpandedRows] = useState([])
  const [existingManagerModalVisible, setExistingManagerModalVisible] = useState(false)
  const [existingManagerForm] = Form.useForm()
  const [availableLevel2Managers, setAvailableLevel2Managers] = useState([])
  const [loading, setLoading] = useState(false)
  
  // 使用OrchardContext中的currentUser
  const { currentUser } = useOrchard()

  // 组件加载时获取管理者列表
  useEffect(() => {
    if (currentUser) {
      refreshManagers(currentUser)
    }
  }, [currentUser])

  const ORCHARD_OPTIONS = [
    { value: 'xingfu', label: '幸福果园' },
    { value: 'lvse', label: '绿色果园' },
    { value: 'fengshou', label: '丰收果园' },
    { value: 'none', label: '暂无果园' }
  ]

  const refreshManagers = async (currentUserData = null) => {
    setLoading(true)
    try {
      const response = await usersApi.getList()
      if (response.data) {
        // 处理用户数据，建立层级关系
        let users = response.data.map(user => ({
          ...user,
          account: user.username,
          key: user.id
        }))
        
        // 使用传入的currentUserData或当前state中的currentUser
        const userData = currentUserData || currentUser
        
        // 权限过滤：如果不是超级管理员，只显示自己和下属
        if (userData && userData.role !== 'superadmin') {
          // 一级管理者只能看到自己和自己手下的二级管理者
          if (userData.role === 'admin' || userData.role === 'level1') {
            users = users.filter(u => {
              // 是自己
              if (u.id === userData.id) return true
              // 是自己手下的二级管理者（通过果园匹配）
              const currentUserOrchards = userData.managed_orchards || []
              const userOrchards = u.managed_orchards || []
              const isSubordinate = userOrchards.some(orchard => currentUserOrchards.includes(orchard))
              return isSubordinate && (u.role === 'operator' || u.role === 'level2')
            })
          } else {
            // 二级管理者只能看到自己
            users = users.filter(u => u.id === userData.id)
          }
        }
        
        // 分离一级和二级管理者
        const level1Managers = users.filter(u => u.role === 'admin' || u.role === 'level1' || u.role === 'superadmin')
        const level2Managers = users.filter(u => u.role === 'operator' || u.role === 'level2')
        
        // 为所有二级管理者找到其一级管理者并设置parentName
        level2Managers.forEach(l2 => {
          const parent = level1Managers.find(l1 => 
            l1.subordinates?.includes(l2.id) || 
            l1.managed_orchards?.some(orchard => l2.managed_orchards?.includes(orchard))
          )
          l2.parentManager = parent
          l2.parentName = parent?.name
          l2.isLevel2 = true
          l2.key = l2.id
        })
        
        // 构建树形结构数据
        const assignedLevel2Ids = new Set()
        const treeData = level1Managers.map(l1 => {
          const children = level2Managers.filter(l2 => {
            // 检查是否已分配
            if (assignedLevel2Ids.has(l2.id)) return false
            // 检查是否属于当前一级管理者
            const isMatch = l2.parentManager?.id === l1.id || l1.subordinates?.includes(l2.id)
            if (isMatch) assignedLevel2Ids.add(l2.id)
            return isMatch
          }).map(l2 => ({...l2, key: `child-${l2.id}`}))
          
          return {
            ...l1,
            isLevel1: true,
            children
          }
        })
        
        // 如果是超级管理员，确保所有二级管理者都有parentName
        if (userData && userData.role === 'superadmin') {
          level2Managers.forEach(l2 => {
            if (!l2.parentName) {
              // 为没有找到父级的二级管理者分配默认父级
              const defaultParent = level1Managers.find(l1 => l1.role === 'admin' || l1.role === 'level1')
              if (defaultParent) {
                l2.parentName = defaultParent.name
                l2.parentManager = defaultParent
              }
            }
          })
        }
        
        setManagers(treeData)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 权限检查：二级管理者只能编辑自己
  const canEdit = (record) => {
    if (!currentUser) return false
    if (currentUser.role === 'admin' || currentUser.role === 'superadmin') return true
    return currentUser.id === record.id
  }

  const handleAdd = () => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
      message.error('只有一级管理者可以添加用户')
      return
    }
    setEditingManager(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleAddExisting = async () => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
      message.error('只有一级管理者可以添加用户')
      return
    }
    
    try {
      // 获取所有用户
      const response = await usersApi.getList()
      if (response.data) {
        // 筛选出没有一级管理者的二级管理者
        const level2Managers = response.data.filter(u => 
          (u.role === 'operator' || u.role === 'level2') && 
          !u.parentManager && !u.parentName
        )
        setAvailableLevel2Managers(level2Managers)
      }
    } catch (error) {
      console.error('获取可用二级管理者失败:', error)
      message.error('获取可用二级管理者失败')
    }
    
    existingManagerForm.resetFields()
    setExistingManagerModalVisible(true)
  }

  const handleEdit = (record) => {
    if (!canEdit(record)) {
      message.error('您只能修改自己的信息')
      return
    }
    
    setEditingManager(record)
    
    // 关键修复：不要把 password 传给表单，让密码框保持为空
    const { password, children, isLevel1, isLevel2, parentName, parentManager, ...formValues } = record
    
    form.setFieldsValue({
      ...formValues,
      account: record.username || record.account,
      orchards: record.managed_orchards || (record.orchards?.includes('none') ? ['none'] : record.orchards)
    })
    setModalVisible(true)
  }

  const handleDelete = (userId) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后该管理者将无法登录系统',
      onOk: async () => {
        try {
          await usersApi.delete(userId)
          await refreshManagers()
          message.success('已删除')
        } catch (error) {
          console.error('删除用户失败:', error)
          message.error('删除失败，请重试')
        }
      }
    })
  }

  const handleSave = async (values) => {
    try {
      if (editingManager) {
        // 编辑模式
        
        // 权限检查
        if ((currentUser?.role === 'operator' || currentUser?.role === 'level2') && currentUser?.id !== editingManager.id) {
          message.error('您只能修改自己的信息')
          return
        }
        
        // 构建用户数据
        const userData = {
          name: values.name,
          phone: values.phone,
          role: values.role,
          managed_orchards: values.role === 'admin' || values.role === 'level1'
            ? ['xingfu', 'lvse', 'fengshou']
            : values.orchards
        }
        
        // 如果输入了新密码
        if (values.password && values.password.trim() !== '') {
          userData.password = values.password.trim()
        }
        
        // 更新用户
        await usersApi.update(editingManager.id, userData)
        
      } else {
        // 新增模式
        if (!values.password) {
          message.error('新增用户必须设置密码')
          return
        }
        
        // 创建新用户
        await usersApi.create({
          username: values.account,
          password: values.password,
          name: values.name,
          phone: values.phone,
          role: values.role,
          managed_orchards: values.role === 'admin' || values.role === 'level1'
            ? ['xingfu', 'lvse', 'fengshou']
            : values.orchards
        })
      }
      
      // 刷新列表
      await refreshManagers()
      
      message.success('保存成功')
      setModalVisible(false)
      
      // 如果修改的是当前登录用户的密码，提示重新登录
      if (editingManager && editingManager.id === currentUser?.id && values.password) {
        message.info('密码已修改，请使用新密码重新登录')
      }
    } catch (error) {
      console.error('保存用户失败:', error)
      message.error('保存失败，请重试')
    }
  }

  const handleAddExistingManager = async (values) => {
    try {
      // 验证账号和密码
      const { authApi } = await import('../services/api.js')
      const loginResponse = await authApi.login(values.account, values.password)
      
      if (!loginResponse.success) {
        message.error('账号或密码错误')
        return
      }
      
      const level2User = loginResponse.data.user
      
      // 检查是否是二级管理者
      if (level2User.role !== 'operator' && level2User.role !== 'level2') {
        message.error('只能添加二级管理者')
        return
      }
      
      // 检查是否已有一级管理者
      if (level2User.parentManager || level2User.parentName) {
        message.error('该二级管理者已有所属一级管理者')
        return
      }
      
      // 分配给当前一级管理者
      await usersApi.update(level2User.id, {
        parentManager: currentUser.id,
        parentName: currentUser.name
      })
      
      // 刷新列表
      await refreshManagers()
      
      message.success('添加成功')
      setExistingManagerModalVisible(false)
    } catch (error) {
      console.error('添加已有二级管理者失败:', error)
      message.error('添加失败，请重试')
    }
  }

  // 切换展开/折叠状态
  const toggleExpand = (record) => {
    const key = record.key || record.id
    if (expandedRows.includes(key)) {
      setExpandedRows(expandedRows.filter(k => k !== key))
    } else {
      setExpandedRows([...expandedRows, key])
    }
  }

  // 自定义展开图标
  const expandIcon = (record) => {
    if (!record.children || record.children.length === 0) {
      return <span key={`expand-empty-${record.id}`} style={{ display: 'inline-block', width: 24 }} />
    }
    const isExpanded = expandedRows.includes(record.key || record.id)
    return (
      <Button 
        key={`expand-btn-${record.id}`}
        type="link" 
        icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
        onClick={(e) => {
          e.stopPropagation()
          toggleExpand(record)
        }}
      />
    )
  }

  const columns = [
    {
      title: '',
      key: 'expand',
      width: 50,
      render: (_, record) => expandIcon(record)
    },
    { 
      title: '姓名', 
      dataIndex: 'name',
      render: (name, record) => (
        <Space key={`name-${record.id}`}>
          {name}
          {record.isLevel2 && record.parentName && (
            <Tag size="small" color="blue">{record.parentName}</Tag>
          )}
        </Space>
      )
    },
    { title: '账号', dataIndex: 'account' },
    { title: '手机号', dataIndex: 'phone' },
    { 
      title: '权限等级',
      dataIndex: 'role',
      render: (role, record) => (
        <Tag key={`role-${record.id}`} color={role === 'admin' || role === 'level1' ? 'red' : 'blue'}>
          {role === 'admin' || role === 'level1' ? '一级管理者' : '二级管理者'}
        </Tag>
      )
    },
    { 
      title: '管理果园',
      dataIndex: 'managed_orchards',
      render: (managed_orchards, record) => {
        const orchards = managed_orchards || record.orchards || []
        // 确保 orchards 是数组且元素是字符串
        const normalizedOrchards = Array.isArray(orchards) 
          ? orchards.map(o => typeof o === 'object' ? o.value || o.id || String(o) : o)
          : []
        return (
          <span key={`orchards-${record.id}`}>
            {normalizedOrchards.includes('none')
              ? <Tag key="none">暂无果园</Tag>
              : normalizedOrchards.map((id, index) => {
                  const orchardId = String(id)
                  const orchard = ORCHARD_OPTIONS.find(o => o.value === orchardId)
                  return <Tag key={`${record.id}-orchard-${index}-${orchardId}`}>{orchard?.label || orchardId}</Tag>
                })
            }
          </span>
        )
      }
    },
    { 
      title: '操作',
      render: (_, record) => (
        <div key={`actions-${record.id}`}>
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
              onClick={() => handleDelete(record.id)} 
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
        (currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
          <Dropdown>
            <Button type="primary" icon={<PlusOutlined />}>
              添加管理者 <DownOutlined />
            </Button>
            <Menu>
              <Menu.Item key="add-new" onClick={handleAdd}>
                新增二级管理者
              </Menu.Item>
              <Menu.Item key="add-existing" onClick={handleAddExisting}>
                添加已有二级管理者
              </Menu.Item>
            </Menu>
          </Dropdown>
        )
      }>
        <Table 
          dataSource={managers} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          expandable={{
            expandedRowKeys: expandedRows,
            onExpandedRowsChange: setExpandedRows,
            expandIcon: () => null, // 隐藏默认展开图标，使用自定义的
            childrenColumnName: 'children'
          }}
        />
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
            <Select disabled={currentUser.role === 'operator' || currentUser.role === 'level2'}>
              <Select.Option value="admin">一级管理者（所有权限）</Select.Option>
              <Select.Option value="operator">二级管理者（仅指定果园）</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            name="orchards" 
            label="分配果园" 
            rules={[{ required: true, message: '请至少选择一个果园' }]} 
          >
            <Select mode="multiple" disabled={currentUser.role === 'operator' || currentUser.role === 'level2'}>
              {ORCHARD_OPTIONS.map(opt => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal 
        title="添加已有二级管理者" 
        open={existingManagerModalVisible} 
        onCancel={() => setExistingManagerModalVisible(false)} 
        onOk={() => existingManagerForm.submit()} 
        width={600} 
      >
        <Form form={existingManagerForm} layout="vertical" onFinish={handleAddExistingManager}>
          <Form.Item name="account" label="二级管理者账号" rules={[{ required: true }]}>
            <Input placeholder="请输入二级管理者的登录账号" />
          </Form.Item>
          
          <Form.Item name="password" label="二级管理者密码" rules={[{ required: true }]}>
            <Input.Password placeholder="请输入二级管理者的登录密码" />
          </Form.Item>
          
          <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>说明：</p>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              <li>添加已有二级管理者时，需要验证其账号和密码</li>
              <li>只有没有所属一级管理者的二级管理者才能被添加</li>
              <li>添加后，该二级管理者将隶属于当前一级管理者</li>
            </ul>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default TeamManagement
