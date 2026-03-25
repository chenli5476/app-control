import React, { createContext, useState, useContext, useCallback } from 'react'
import { useOrchard } from './OrchardContext.jsx'

// 创建任务上下文
const TaskContext = createContext()

// 模拟初始任务数据
const initialTasks = [
  {
    id: 1,
    title: '苹果树施肥',
    type: '周期性任务',
    priority: '高',
    assignee: '张三',
    startDate: '2026-02-28',
    endDate: '2026-02-28',
    status: '待办',
    description: '使用复合肥，每株0.5公斤',
    materials: ['复合肥', '施肥工具'],
    orchardId: 'xingfu'
  },
  {
    id: 2,
    title: '梨树病虫害防治',
    type: '周期性任务',
    priority: '中',
    assignee: '李四',
    startDate: '2026-03-01',
    endDate: '2026-03-01',
    status: '待办',
    description: '喷洒杀虫剂，防治蚜虫',
    materials: ['杀虫剂', '喷雾器'],
    orchardId: 'lvse'
  },
  {
    id: 3,
    title: '桃树修剪',
    type: '季节性任务',
    priority: '低',
    assignee: '王五',
    startDate: '2026-03-05',
    endDate: '2026-03-10',
    status: '待办',
    description: '冬季修剪，去除病枝、弱枝',
    materials: ['修剪工具', '防护装备'],
    orchardId: 'fengshou'
  }
]

// 任务提供者组件
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(initialTasks)
  const { currentOrchardId } = useOrchard()

  // 切换任务状态
  const toggleTaskStatus = (id) => {
    setTasks(prevTasks => {
      return prevTasks.map(task => 
        task.id === id ? { ...task, status: task.status === '待办' ? '已完成' : '待办' } : task
      )
    })
  }

  // 添加新任务
  const addTask = (task) => {
    const newTask = {
      ...task,
      orchardId: currentOrchardId
    }
    setTasks(prevTasks => [...prevTasks, newTask])
  }

  // 删除任务
  const deleteTask = (id) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id))
  }

  // 编辑任务
  const editTask = (id, updatedTask) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === id ? { ...task, ...updatedTask } : task
    ))
  }

  // 获取当前果园的任务
  const getCurrentOrchardTasks = useCallback(() => {
    return tasks.filter(task => task.orchardId === currentOrchardId)
  }, [tasks, currentOrchardId])

  // 获取待办任务数
  const getPendingTaskCount = useCallback(() => {
    return getCurrentOrchardTasks().filter(task => task.status === '待办').length
  }, [getCurrentOrchardTasks])

  // 获取待办任务列表
  const getPendingTasks = useCallback(() => {
    return getCurrentOrchardTasks().filter(task => task.status === '待办')
  }, [getCurrentOrchardTasks])

  // 获取按状态排序的任务列表
  const getSortedTasks = useCallback(() => {
    const currentTasks = getCurrentOrchardTasks()
    return [...currentTasks].sort((a, b) => {
      // 待办排在前面（0），已完成排在后面（1）
      const statusOrder = { '待办': 0, '已完成': 1 }
      return statusOrder[a.status] - statusOrder[b.status]
    })
  }, [getCurrentOrchardTasks])

  const value = {
    tasks,
    setTasks,
    toggleTaskStatus,
    addTask,
    deleteTask,
    editTask,
    getPendingTaskCount,
    getPendingTasks,
    getSortedTasks
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}

// 自定义钩子，方便组件使用任务上下文
export const useTask = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider')
  }
  return context
}
