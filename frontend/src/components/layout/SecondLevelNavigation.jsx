import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import { useOrchard } from '../../contexts/OrchardContext'

const SecondLevelNavigation = () => {
  const location = useLocation()
  const currentPath = location.pathname
  const { isAdmin } = useOrchard()

  const pathToKey = {
    '/': '1',
    '/daily-checkin': '2',
    '/ai-plant-doctor': '3',
    '/tree-records': '4',
    '/task-scheduler': '5',
    '/inventory': '6',
    '/analytics': '7',
    '/multi-tenancy': '8',
    '/team-management': '9',
    '/knowledge-base': '10',
    '/app-feedback': '11',
    '/emergency-alerts': '12',
    '/recycle-bin': '13',
    '/about-us': '14'
  }

  const selectedKey = pathToKey[currentPath] || '1'

  const baseItems = [
    { key: '4', label: <Link to="/tree-records">果树档案</Link> },
    { key: '5', label: <Link to="/task-scheduler">任务计划</Link> },
    { key: '6', label: <Link to="/inventory">农资库存</Link> },
    { key: '7', label: <Link to="/analytics">数据分析</Link> },
    { key: '8', label: <Link to="/multi-tenancy">多果园管理</Link> },
    { key: '10', label: <Link to="/knowledge-base">知识库</Link> },
    { key: '11', label: <Link to="/app-feedback">问题反馈</Link> },
    { key: '12', label: <Link to="/emergency-alerts">紧急预警</Link> },
    { key: '13', label: <Link to="/recycle-bin">回收站</Link> },
    { key: '14', label: <Link to="/about-us">关于我们</Link> },
  ]

  const adminItem = { key: '9', label: <Link to="/team-management">团队管理</Link> }
  
  const items = isAdmin 
    ? [...baseItems.slice(0, 5), adminItem, ...baseItems.slice(5)]
    : baseItems

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[selectedKey]}
      style={{ 
        width: '100%', 
        backgroundColor: 'transparent', 
        borderBottom: 'none', 
        fontSize: 13,
        lineHeight: '48px'
      }}
      items={items}
      overflowedIndicator={null}
    />
  )
}

export default SecondLevelNavigation
