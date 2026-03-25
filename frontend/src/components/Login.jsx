import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, message, Modal } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons'
import { authApi } from '../services/api.js'
import { ROLES } from '../config/auth.js'
import { useNavigate } from 'react-router-dom'

const Login = ({ onLogin }) => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [registerForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [registerVisible, setRegisterVisible] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const response = await authApi.login(values.username, values.password)
      
      if (response.success) {
        const user = response.data.user
        onLogin(user)
        message.success(`欢迎回来，${user.name}`)
        
        switch (user.role) {
          case ROLES.SUPER_ADMIN:
            navigate('/admin')
            break
          case ROLES.LEVEL_1:
            navigate('/level1')
            break
          default:
            navigate('/')
        }
      }
    } catch (error) {
      message.error(error.message || '账号或密码错误')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = () => {
    setRegisterVisible(true)
  }

  const handleRegisterCancel = () => {
    setRegisterVisible(false)
    registerForm.resetFields()
  }

  const handleRegisterSubmit = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }

    try {
      const response = await authApi.register({
        username: values.username,
        password: values.password,
        phone: values.phone,
        role: 'level2'
      })
      
      if (response.success) {
        message.success('账号创建成功，请登录')
        setRegisterVisible(false)
        registerForm.resetFields()
      }
    } catch (error) {
      message.error(error.message || '注册失败')
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f2f5', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px'
    }}>
      <Card 
        title="果树智慧管理系统" 
        style={{ 
          width: 400, 
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        styles={{ 
          header: { 
            backgroundColor: '#52c41a', 
            color: '#fff',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '18px'
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入账号" 
              style={{ borderRadius: 4 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入密码" 
              style={{ borderRadius: 4 }}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ 
                width: '100%', 
                height: 40, 
                fontSize: '16px',
                backgroundColor: '#52c41a',
                borderColor: '#52c41a'
              }}
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <div style={{ flex: 1, height: 1, backgroundColor: '#e8e8e8' }}></div>
              <span style={{ margin: '0 16px', color: '#999' }}>或</span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#e8e8e8' }}></div>
            </div>
            <Button 
              type="default" 
              style={{ 
                width: '100%', 
                height: 40, 
                fontSize: '16px'
              }}
              onClick={handleRegister}
            >
              创建账号
            </Button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <p style={{ color: '#999', fontSize: '14px', marginBottom: 8 }}>默认账号：</p>
            <p style={{ color: '#999', fontSize: '14px', marginBottom: 4 }}>• 超级管理员：15205036033 / 121380</p>
            <p style={{ color: '#999', fontSize: '14px', marginBottom: 4 }}>• 一级权限：15367896477 / 123456</p>
            <p style={{ color: '#999', fontSize: '14px' }}>• 二级权限：15205036034 / 123456</p>
          </div>
        </Form>
      </Card>

      <Modal
        title="创建账号"
        open={registerVisible}
        onCancel={handleRegisterCancel}
        footer={null}
        width={400}
      >
        <Form
          form={registerForm}
          layout="vertical"
          onFinish={handleRegisterSubmit}
        >
          <Form.Item
            name="username"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入账号" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入密码" 
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            rules={[{ required: true, message: '请确认密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请确认密码" 
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="请输入手机号（选填）" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%' }}
            >
              创建账号
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Login
