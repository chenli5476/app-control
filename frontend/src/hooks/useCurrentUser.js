import { useState, useEffect } from 'react'
import { authApi } from '../services/api.js'

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authApi.getCurrentUser()
        if (response.data) {
          setCurrentUser(response.data)
        }
      } catch (error) {
        console.error('获取当前用户失败:', error)
        // 清除本地存储的登录状态
        localStorage.removeItem('auth_token')
        localStorage.removeItem('currentUser')
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  return { currentUser, loading }
}
