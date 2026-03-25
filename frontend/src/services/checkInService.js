// services/checkInService.js
import { checkInApi } from './api.js'

export const checkInService = {
  // 获取所有记录
  async getAll() {
    try {
      const response = await checkInApi.getList()
      return response.data || []
    } catch (error) {
      console.error('获取打卡记录失败:', error)
      return []
    }
  },

  // 保存记录
  async save(record) {
    try {
      const response = await checkInApi.create(record.orchardId || null, record.details || null)
      return response.data
    } catch (error) {
      console.error('保存打卡记录失败:', error)
      throw error
    }
  },

  // 更新记录（用于后续变更人员）
  async update(id, updates) {
    try {
      // 注意：checkInApi 没有直接的更新方法，可能需要根据实际 API 设计调整
      console.warn('checkInApi 暂不支持更新操作')
      return null
    } catch (error) {
      console.error('更新打卡记录失败:', error)
      return null
    }
  },

  // 获取单条记录
  async getById(id) {
    try {
      const records = await this.getAll()
      return records.find(r => r.id === id)
    } catch (error) {
      console.error('获取打卡记录失败:', error)
      return null
    }
  },

  // 获取今天的打卡记录
  async getToday() {
    try {
      const response = await checkInApi.getToday()
      return response.data
    } catch (error) {
      console.error('获取今日打卡记录失败:', error)
      return null
    }
  },

  // 获取统计数据
  async getStats(year, month) {
    try {
      const response = await checkInApi.getStats(year, month)
      return response.data
    } catch (error) {
      console.error('获取打卡统计数据失败:', error)
      return null
    }
  }
}