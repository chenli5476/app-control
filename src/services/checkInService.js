// services/checkInService.js

const CHECKIN_KEY = 'orchard_checkin_records'

export const checkInService = {
  // 获取所有记录
  getAll() {
    const data = localStorage.getItem(CHECKIN_KEY)
    return data ? JSON.parse(data) : []
  },

  // 保存记录
  save(record) {
    const records = this.getAll()
    records.push({
      ...record,
      id: Date.now().toString()
    })
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(records))
    return record
  },

  // 更新记录（用于后续变更人员）
  update(id, updates) {
    const records = this.getAll()
    const index = records.findIndex(r => r.id === id)
    if (index === -1) return null
    
    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(records))
    return records[index]
  },

  // 获取单条记录
  getById(id) {
    const records = this.getAll()
    return records.find(r => r.id === id)
  }
}