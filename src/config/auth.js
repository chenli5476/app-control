// 权限常量
export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  LEVEL_1: 'level1',
  LEVEL_2: 'level2'
}

// 默认用户配置（首次使用）
const DEFAULT_USERS = {
  '121380': { id: 'zhilan', name: '知澜', password: '121380', role: ROLES.SUPER_ADMIN, managedOrchards: [], subordinates: [], phone: '13800138000' },
  'level1_001': { id: 'level1_001', name: '张老板', password: '123456', role: ROLES.LEVEL_1, parentId: null, managedOrchards: ['xingfu', 'lvse'], subordinates: ['level2_001', 'level2_002'], phone: '13900139000' },
  'level2_001': { id: 'level2_001', name: '李管理', password: '123456', role: ROLES.LEVEL_2, parentId: 'level1_001', managedOrchards: ['xingfu'], phone: '13700137000' },
  'level2_002': { id: 'level2_002', name: '王管理', password: '123456', role: ROLES.LEVEL_2, parentId: 'level1_001', managedOrchards: ['lvse'], phone: '13600136000' }
}

// 获取用户列表（从 localStorage 或默认）
export const getUsers = () => {
  const saved = localStorage.getItem('system_users')
  return saved ? JSON.parse(saved) : DEFAULT_USERS
}

// 保存用户列表
export const saveUsers = (users) => {
  localStorage.setItem('system_users', JSON.stringify(users))
}

// 验证登录
export const validateLogin = (account, password) => {
  let users = getUsers()
  console.log('登录验证 - 账号:', account)
  console.log('登录验证 - 密码:', password)
  console.log('登录验证 - 用户数据:', users[account])
  
  // 如果账号不存在，检查默认用户
  if (!users[account] && DEFAULT_USERS[account]) {
    console.log('登录验证 - 从默认用户中获取:', account)
    users[account] = DEFAULT_USERS[account]
    saveUsers(users)
  }
  
  const user = users[account]
  if (user && user.password === password) {
    console.log('登录验证 - 成功')
    return user
  }
  console.log('登录验证 - 失败')
  return null
}

// 初始化（如果没有数据）
export const initAuth = () => {
  const saved = localStorage.getItem('system_users')
  if (!saved) {
    saveUsers(DEFAULT_USERS)
  } else {
    // 合并默认用户，防止被覆盖
    const savedUsers = JSON.parse(saved)
    const mergedUsers = { ...DEFAULT_USERS, ...savedUsers }
    saveUsers(mergedUsers)
  }
}

// 注册新用户
export const registerUser = (username, password, phone = '', role = ROLES.LEVEL_2, parentId = null, managedOrchards = []) => {
  const users = getUsers()
  
  // 检查账号是否已存在
  if (users[username]) {
    return { success: false, message: '账号已存在' }
  }
  
  // 创建新用户
  const newUser = {
    id: username,
    name: username, // 暂时使用账号作为名称
    password: password,
    role: role,
    parentId: parentId,
    managedOrchards: managedOrchards,
    subordinates: role === ROLES.LEVEL_1 ? [] : undefined,
    phone: phone
  }
  
  users[username] = newUser
  
  // 如果是二级权限，将其添加到上级的 subordinates 中
  if (parentId && users[parentId]) {
    if (!users[parentId].subordinates) {
      users[parentId].subordinates = []
    }
    users[parentId].subordinates.push(username)
  }
  
  saveUsers(users)
  
  return { success: true, message: '账号创建成功' }
}

// 导出 USERS 以保持兼容性
export const USERS = getUsers()