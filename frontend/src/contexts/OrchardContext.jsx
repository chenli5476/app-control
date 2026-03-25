import React, { createContext, useState, useContext, useCallback, useEffect } from 'react'
import { authApi } from '../services/api.js'

// 创建果园上下文
const OrchardContext = createContext()

// 果园提供者组件
export const OrchardProvider = ({ children }) => {
  // 获取当前用户
  const [currentUser, setCurrentUser] = useState(null)
  
  // 从API获取当前用户信息
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authApi.getCurrentUser()
        if (response.data) {
          setCurrentUser(response.data)
        }
      } catch (error) {
        console.error('获取当前用户失败:', error)
        // 如果API失败，回退到localStorage
        const saved = localStorage.getItem('currentUser')
        if (saved) {
          try {
            setCurrentUser(JSON.parse(saved))
          } catch (e) {
            console.error('解析用户数据失败:', e)
            localStorage.removeItem('currentUser')
          }
        }
      }
    }
    
    fetchCurrentUser()
  }, [])

  // 所有果园数据
  const [allOrchards, setAllOrchards] = useState([
    { id: 'xingfu', name: '幸福果园', area: 50, trees: 1200, contact: '张三' },
    { id: 'lvse', name: '绿色果园', area: 30, trees: 800, contact: '李四' },
    { id: 'fengshou', name: '丰收果园', area: 45, trees: 1000, contact: '王五' }
  ])

  // 从 API 获取果园数据
  useEffect(() => {
    const fetchOrchards = async () => {
      try {
        // 这里可以添加从 API 获取果园数据的逻辑
        // const response = await api.getOrchards()
        // if (response.data) {
        //   setAllOrchards(response.data)
        // }
      } catch (error) {
        console.error('获取果园数据失败:', error)
      }
    }

    fetchOrchards()
  }, [])

  // 根据权限过滤果园
  const accessibleOrchards = currentUser
    ? (currentUser.role === 'superadmin' ? allOrchards : allOrchards.filter(o => currentUser.managedOrchards?.includes(o.id)))
    : []

  const [currentOrchardId, setCurrentOrchardId] = useState(() => {
    // 默认选中第一个有权限的果园
    return accessibleOrchards[0]?.id || 'xingfu'
  })

  const currentOrchard = accessibleOrchards.find(o => o.id === currentOrchardId)

  const switchOrchard = useCallback((orchardId) => {
    setCurrentOrchardId(orchardId)
  }, [])

  // 过滤数据函数
  const filterByOrchard = useCallback((data) => {
    if (!Array.isArray(data)) return data
    if (currentUser?.role === 'superadmin') {
      // 超级管理员看所有数据，但按当前选中果园筛选
      return data.filter(item => item.orchardId === currentOrchardId)
    }
    // 其他用户只能看自己管理的果园的数据
    return data.filter(item => 
      currentUser?.managedOrchards?.includes(item.orchardId) && 
      item.orchardId === currentOrchardId
    )
  }, [currentOrchardId, currentUser])

  // 是否有权限查看某个果园
  const canAccessOrchard = (orchardId) => {
    return currentUser?.role === 'superadmin' || 
           currentUser?.managedOrchards?.includes(orchardId)
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
      isAdmin: currentUser?.role === 'superadmin' || currentUser?.role === 'admin' || currentUser?.role === 'level1'
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
