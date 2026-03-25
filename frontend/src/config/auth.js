// 权限常量
export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  LEVEL_1: 'level1',
  LEVEL_2: 'level2'
}



// 从 API 获取用户列表
export const getUsers = async () => {
  try {
    const { usersApi } = await import('../services/api.js')
    const response = await usersApi.getList()
    return response.data || {}
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return {}
  }
}

// 保存用户（使用 API）
export const saveUsers = async (users) => {
  try {
    const { usersApi } = await import('../services/api.js')
    // 遍历用户并保存
    for (const [account, user] of Object.entries(users)) {
      if (!user.id) {
        await usersApi.create({
          username: account,
          password: user.password,
          name: user.name,
          role: user.role,
          parent_id: user.parentId,
          managed_orchards: user.managedOrchards,
          phone: user.phone
        })
      } else {
        await usersApi.update(user.id, {
          name: user.name,
          role: user.role,
          parent_id: user.parentId,
          managed_orchards: user.managedOrchards,
          phone: user.phone
        })
      }
    }
  } catch (error) {
    console.error('保存用户列表失败:', error)
  }
}

// 验证登录（使用 API）
export const validateLogin = async (account, password) => {
  try {
    const { authApi } = await import('../services/api.js')
    const response = await authApi.login(account, password)
    if (response.success) {
      return response.data.user
    }
    return null
  } catch (error) {
    console.error('登录验证失败:', error)
    return null
  }
}

// 初始化（如果需要）
export const initAuth = async () => {
  // 现在使用 API，不需要本地初始化
  console.log('Auth initialized with API')
}

// 注册新用户（使用 API）
export const registerUser = async (username, password, phone = '', role = ROLES.LEVEL_2, parentId = null, managedOrchards = []) => {
  try {
    const { usersApi } = await import('../services/api.js')
    await usersApi.create({
      username: username,
      password: password,
      name: username, // 暂时使用账号作为名称
      role: role,
      parent_id: parentId,
      managed_orchards: managedOrchards,
      phone: phone
    })
    return { success: true, message: '账号创建成功' }
  } catch (error) {
    console.error('注册用户失败:', error)
    return { success: false, message: error.message || '注册失败' }
  }
}

