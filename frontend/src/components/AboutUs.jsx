import React, { useState } from 'react'
import { Card, Tabs, List, Avatar, Button, Divider } from 'antd'
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, WechatOutlined } from '@ant-design/icons'



// 模拟团队成员数据
const teamMembers = [
  {
    id: 1,
    name: '张三',
    position: '产品经理',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: '拥有5年农业科技产品经验，专注于用户体验设计'
  },
  {
    id: 2,
    name: '李四',
    position: '前端开发',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'React技术专家，负责应用界面开发'
  },
  {
    id: 3,
    name: '王五',
    position: '后端开发',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    bio: 'Node.js专家，负责服务器端开发和数据库设计'
  },
  {
    id: 4,
    name: '赵六',
    position: '农业顾问',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    bio: '资深农业专家，拥有20年果园管理经验'
  }
]

// 模拟合作伙伴数据
const partners = [
  {
    id: 1,
    name: '绿色农资有限公司',
    category: '农资企业',
    logo: 'https://via.placeholder.com/100x50?text=Green+Agri'
  },
  {
    id: 2,
    name: '农业科技大学',
    category: '农业院校',
    logo: 'https://via.placeholder.com/100x50?text=Agricultural+University'
  },
  {
    id: 3,
    name: '智慧农业研究所',
    category: '研究机构',
    logo: 'https://via.placeholder.com/100x50?text=Smart+Agriculture+Institute'
  }
]

// 模拟会员服务数据
const membershipServices = [
  {
    id: 1,
    name: '基础会员',
    price: '免费',
    features: [
      '每日打卡功能',
      '基本AI诊断',
      '反馈功能',
      '基础数据统计'
    ]
  },
  {
    id: 2,
    name: '高级会员',
    price: '¥99/月',
    features: [
      '所有基础功能',
      '高级AI诊断',
      '专家在线咨询',
      '详细数据分析',
      '优先技术支持',
      '农资购买优惠'
    ]
  },
  {
    id: 3,
    name: '企业会员',
    price: '¥299/月',
    features: [
      '所有高级功能',
      '团队协作管理',
      '定制化报表',
      '专属农业顾问',
      'API接口访问',
      '企业级技术支持'
    ]
  }
]

const AboutUs = () => {
  const [activeTab, setActiveTab] = useState('product')

  const tabItems = [
    {
      key: 'product',
      label: '产品信息',
      children: (
        <Card title="果树智慧管理系统" styles={{ header: { backgroundColor: '#1B3A2F', color: '#fff' } }}>
          <div style={{ lineHeight: 1.8 }}>
            <h3>应用版本</h3>
            <p>当前版本：v1.0.0</p>
            <h3 style={{ marginTop: 24 }}>更新日志</h3>
            <ul>
              <li>2026-03-09：v1.0.0 正式版本发布，包含所有核心功能</li>
              <li>2026-03-08：v1.0.0-rc 候选版本发布，修复已知bug</li>
              <li>2026-03-05：v0.9.0 测试版本发布，添加多果园管理功能</li>
              <li>2026-03-01：v0.8.0 测试版本发布，添加AI果树医生功能</li>
              <li>2026-02-20：v0.5.0 测试版本发布，实现基本功能框架</li>
            </ul>
            <h3 style={{ marginTop: 24 }}>功能介绍</h3>
            <ul>
              <li>果园概览：实时查看果园基本信息和关键数据</li>
              <li>AI果树医生：基于AI的果树病虫害诊断与种植咨询</li>
              <li>任务计划：创建、管理和跟踪果园任务</li>
              <li>农资库存：管理果园农资的入库、出库和库存状态</li>
              <li>数据分析：提供果园运营数据的统计和分析</li>
              <li>多果园管理：支持管理多个果园的信息</li>
            </ul>
            <h3 style={{ marginTop: 24 }}>使用指南</h3>
            <p>1. 登录系统：使用账号密码登录系统</p>
            <p>2. 导航操作：通过顶部导航栏访问各个功能模块</p>
            <p>3. 快捷入口：在果园概览页面使用快捷入口快速访问常用功能</p>
            <p>4. 数据管理：在各个模块中进行数据的添加、编辑和删除操作</p>
            <p>5. 紧急预警：查看和处理系统生成的紧急预警信息</p>
            <h3 style={{ marginTop: 24 }}>隐私政策</h3>
            <p>我们致力于保护用户隐私，所有数据均加密存储，不会向第三方分享您的个人信息。</p>
            <h3 style={{ marginTop: 24 }}>用户协议</h3>
            <p>使用本应用即表示您同意我们的用户协议，详情请查看完整协议内容。</p>
          </div>
        </Card>
      )
    },
    {
      key: 'team',
      label: '团队介绍',
      children: (
        <>
          <Card title="开发团队">
            <List
              grid={{ gutter: 16, column: 2 }}
              dataSource={teamMembers}
              renderItem={(member) => (
                <List.Item>
                  <Card
                    cover={<img alt={member.name} src={member.avatar} style={{ height: 200, objectFit: 'cover' }} />}
                    title={member.name}
                    extra={<div>{member.position}</div>}
                  >
                    <p>{member.bio}</p>
                  </Card>
                </List.Item>
              )}
            />
          </Card>

          <Card title="合作伙伴" style={{ marginTop: 24 }}>
            <List
              grid={{ gutter: 16, column: 3 }}
              dataSource={partners}
              renderItem={(partner) => (
                <List.Item>
                  <Card
                    cover={<img alt={partner.name} src={partner.logo} style={{ height: 100, objectFit: 'contain' }} />}
                    title={partner.name}
                    extra={<div>{partner.category}</div>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </>
      )
    },
    {
      key: 'contact',
      label: '联系方式',
      children: (
        <Card title="联系我们">
          <div style={{ lineHeight: 2 }}>
            <p><PhoneOutlined /> 客服热线：400-123-4567</p>
            <p><MailOutlined /> 邮箱：support@orchardsystem.com</p>
            <p><EnvironmentOutlined /> 地址：北京市海淀区中关村科技园区</p>
            <p><WechatOutlined /> 官方微信：果园管理系统</p>
          </div>
        </Card>
      )
    },
    {
      key: 'services',
      label: '增值服务',
      children: (
        <>
          <Card title="会员服务">
            <List
              grid={{ gutter: 16, column: 3 }}
              dataSource={membershipServices}
              renderItem={(service) => (
                <List.Item>
                  <Card
                    title={service.name}
                    extra={<div style={{ fontSize: 20, fontWeight: 'bold' }}>{service.price}</div>}
                  >
                    <ul>
                      {service.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                    <Button type="primary" style={{ marginTop: 16, width: '100%' }}>
                      立即开通
                    </Button>
                  </Card>
                </List.Item>
              )}
            />
          </Card>

          <Card title="农资商城" style={{ marginTop: 24 }}>
            <div style={{ textAlign: 'center', padding: 48 }}>
              <h3>农资购买入口</h3>
              <p style={{ marginBottom: 24 }}>点击下方按钮进入农资商城，购买农药、肥料、工具等</p>
              <Button type="primary" size="large">
                进入商城
              </Button>
            </div>
          </Card>
        </>
      )
    }
  ]

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  )
}

export default AboutUs