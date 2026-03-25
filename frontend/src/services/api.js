import aiConfig from '../config/ai.config.js'

const API_BASE_URL = aiConfig.api.baseUrl

const getAuthToken = () => {
  return localStorage.getItem('auth_token')
}

const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token)
}

const removeAuthToken = () => {
  localStorage.removeItem('auth_token')
}

const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  }
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || '请求失败')
    }
    
    return data
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接')
    }
    throw error
  }
}

export const authApi = {
  login: async (username, password) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    
    if (response.success && response.data.token) {
      setAuthToken(response.data.token)
      localStorage.setItem('currentUser', JSON.stringify(response.data.user))
    }
    
    return response
  },
  
  register: async (userData) => {
    return await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  },
  
  logout: async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error('Logout error:', e)
    }
    removeAuthToken()
    localStorage.removeItem('currentUser')
  },
  
  getCurrentUser: async () => {
    return await apiRequest('/api/auth/me')
  },
  
  changePassword: async (oldPassword, newPassword) => {
    return await apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
    })
  },
  
  verifyToken: async () => {
    return await apiRequest('/api/auth/verify')
  }
}

export const usersApi = {
  getList: async (role = null, status = null) => {
    const params = new URLSearchParams()
    if (role) params.append('role', role)
    if (status) params.append('status', status)
    return await apiRequest(`/api/users/list?${params.toString()}`)
  },
  
  getUser: async (userId) => {
    return await apiRequest(`/api/users/${userId}`)
  },
  
  create: async (userData) => {
    return await apiRequest('/api/users/create', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  },
  
  update: async (userId, userData) => {
    return await apiRequest(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  },
  
  ban: async (userId, reason = null) => {
    return await apiRequest(`/api/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  },
  
  unban: async (userId) => {
    return await apiRequest(`/api/users/${userId}/unban`, {
      method: 'POST'
    })
  },
  
  delete: async (userId) => {
    return await apiRequest(`/api/users/${userId}`, {
      method: 'DELETE'
    })
  },
  
  getSubordinates: async () => {
    return await apiRequest('/api/users/subordinates/list')
  }
}

export const chatApi = {
  saveMessage: async (role, content, imageUrl = null) => {
    return await apiRequest('/api/chat/history', {
      method: 'POST',
      body: JSON.stringify({ role, content, image_url: imageUrl })
    })
  },
  
  getHistory: async (limit = 50, offset = 0) => {
    return await apiRequest(`/api/chat/history?limit=${limit}&offset=${offset}`)
  },
  
  clearHistory: async () => {
    return await apiRequest('/api/chat/history', { method: 'DELETE' })
  },
  
  deleteMessage: async (messageId) => {
    return await apiRequest(`/api/chat/history/${messageId}`, { method: 'DELETE' })
  }
}

export const checkInApi = {
  create: async (orchardId = null, note = null) => {
    return await apiRequest('/api/checkins/', {
      method: 'POST',
      body: JSON.stringify({ orchard_id: orchardId, note })
    })
  },
  
  getList: async (year = null, month = null, userId = null) => {
    const params = new URLSearchParams()
    if (year) params.append('year', year)
    if (month) params.append('month', month)
    if (userId) params.append('user_id', userId)
    return await apiRequest(`/api/checkins/list?${params.toString()}`)
  },
  
  getToday: async () => {
    return await apiRequest('/api/checkins/today')
  },
  
  getStats: async (year = null, month = null) => {
    const params = new URLSearchParams()
    if (year) params.append('year', year)
    if (month) params.append('month', month)
    return await apiRequest(`/api/checkins/stats?${params.toString()}`)
  },
  
  delete: async (checkInId) => {
    return await apiRequest(`/api/checkins/${checkInId}`, { method: 'DELETE' })
  }
}

export const notificationApi = {
  getList: async (unreadOnly = false, limit = 20, offset = 0) => {
    return await apiRequest(`/api/notifications/list?unread_only=${unreadOnly}&limit=${limit}&offset=${offset}`)
  },
  
  create: async (title, content = null, type = 'system', userId = null) => {
    return await apiRequest('/api/notifications/', {
      method: 'POST',
      body: JSON.stringify({ title, content, notification_type: type, user_id: userId })
    })
  },
  
  broadcast: async (title, content = null, type = 'system') => {
    return await apiRequest('/api/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, content, notification_type: type })
    })
  },
  
  markRead: async (notificationId) => {
    return await apiRequest(`/api/notifications/${notificationId}/read`, { method: 'PUT' })
  },
  
  markAllRead: async () => {
    return await apiRequest('/api/notifications/read-all', { method: 'PUT' })
  },
  
  delete: async (notificationId) => {
    return await apiRequest(`/api/notifications/${notificationId}`, { method: 'DELETE' })
  },
  
  getUnreadCount: async () => {
    return await apiRequest('/api/notifications/unread-count')
  }
}

export const systemApi = {
  getStatus: async () => {
    return await apiRequest('/api/status')
  }
}

export { getAuthToken, setAuthToken, removeAuthToken }
