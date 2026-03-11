import React, { createContext, useState, useContext, useCallback } from 'react'

// 创建果园上下文
const OrchardContext = createContext()

// 果园提供者组件
export const OrchardProvider = ({ children }) => {
  // 获取当前用户
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  // 所有果园数据
  const ALL_ORCHARDS = [
    { id: 'xingfu', name: '幸福果园', area: 50, trees: 1200, contact: '张三' },
    { id: 'lvse', name: '绿色果园', area: 30, trees: 800, contact: '李四' },
    { id: 'fengshou', name: '丰收果园', area: 45, trees: 1000, contact: '王五' }
  ]

  // 根据权限过滤果园
  const accessibleOrchards = currentUser
    ? (currentUser.role === 'admin' ? ALL_ORCHARDS : ALL_ORCHARDS.filter(o => currentUser.orchards?.includes(o.id)))
    : []

  const [currentOrchardId, setCurrentOrchardId] = useState(() => {
    // 默认选中第一个有权限的果园
    return accessibleOrchards[0]?.id || 'xingfu'
  })

  const currentOrchard = accessibleOrchards.find(o => o.id === currentOrchardId)

  const switchOrchard = useCallback((orchardId) => {
    setCurrentOrchardId(orchardId)
    console.log('切换到果园:', orchardId)
  }, [])

  // 过滤数据函数
  const filterByOrchard = useCallback((data) => {
    if (!Array.isArray(data)) return data
    if (currentUser?.role === 'admin') {
      // 管理员看所有数据，但按当前选中果园筛选
      return data.filter(item => item.orchardId === currentOrchardId)
    }
    // 操作员只能看自己果园的数据
    return data.filter(item => 
      currentUser?.orchards?.includes(item.orchardId) && 
      item.orchardId === currentOrchardId
    )
  }, [currentOrchardId, currentUser])

  // 调试权限系统
  React.useEffect(() => {
    console.log('=== 权限系统调试 ===')
    console.log('当前用户:', currentUser)
    console.log('所有果园:', ALL_ORCHARDS)
    console.log('有权限的果园:', accessibleOrchards)
    console.log('是否是管理员:', currentUser?.role === 'admin')
  }, [currentUser, accessibleOrchards])

  // 是否有权限查看某个果园
  const canAccessOrchard = (orchardId) => {
    return currentUser?.role === 'admin' || 
           currentUser?.orchards?.includes(orchardId)
  }

  return (
    <OrchardContext.Provider value={{
      currentUser,
      accessibleOrchards,    // 有权限的果园列表
      currentOrchard,
      currentOrchardId,
      switchOrchard,
      filterByOrchard,
      canAccessOrchard,
      isAdmin: currentUser?.role === 'admin'
    }}>
      {children}
    </OrchardContext.Provider>
  )
}

// 自定义钩子，方便组件使用果园上下文
export const useOrchard = () => {
  const context = useContext(OrchardContext)
  if (!context) {
    throw new Error('useOrchard must be used within an OrchardProvider')
  }
  return context
}
