import React, { createContext, useContext, useState, useCallback } from 'react'

const RecycleBinContext = createContext()

export const RecycleBinProvider = ({ children }) => {
  const [deletedItems, setDeletedItems] = useState([])

  // 移入回收站（删除时调用）
  const moveToRecycleBin = useCallback((item, type) => {
    const recycleItem = {
      ...item,
      recycleId: Date.now(),      // 回收站唯一ID
      originalType: type,          // 原类型：tree/inventory/task
      deletedAt: new Date().toISOString(),
      willDeleteAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天后自动清理
    }
    setDeletedItems(prev => [recycleItem, ...prev])
  }, [])

  // 恢复项目
  const restoreItem = useCallback((recycleId) => {
    const item = deletedItems.find(i => i.recycleId === recycleId)
    setDeletedItems(prev => prev.filter(i => i.recycleId !== recycleId))
    return item // 返回给调用方处理恢复逻辑
  }, [deletedItems])

  // 彻底删除
  const permanentDelete = useCallback((recycleId) => {
    setDeletedItems(prev => prev.filter(i => i.recycleId !== recycleId))
  }, [])

  // 清空回收站
  const clearAll = useCallback(() => {
    setDeletedItems([])
  }, [])

  // 按类型筛选
  const getItemsByType = useCallback((type) => {
    if (type === 'all') return deletedItems
    return deletedItems.filter(item => item.originalType === type)
  }, [deletedItems])

  return (
    <RecycleBinContext.Provider value={{
      deletedItems,
      moveToRecycleBin,
      restoreItem,
      permanentDelete,
      clearAll,
      getItemsByType
    }}>
      {children}
    </RecycleBinContext.Provider>
  )
}

export const useRecycleBin = () => useContext(RecycleBinContext)