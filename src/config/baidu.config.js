/**
 * 百度AI API 配置
 * @module baidu.config
 */

// 百度AI API 配置
export const BAIDU_AI_CONFIG = {
  // 认证信息
  APP_ID: '122173336',
  API_KEY: 'qHtAgBRNW4PzKvMQTAnFJFBP',
  SECRET_KEY: 'rdZA5jpaQ5g7T07VCkaqrS66xDWtDqu9',
  
  // API 端点
  TOKEN_URL: 'https://aip.baidubce.com/oauth/2.0/token',
  IMAGE_CLASSIFY_URL: 'https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general',
  
  // 缓存策略
  TOKEN_EXPIRY_BUFFER: 86400, // 提前1天刷新（秒）
  
  // 重试配置
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1秒
  
  // 图片限制
  MAX_IMAGE_SIZE: 4 * 1024 * 1024, // 4MB
  
  // Mock 模式
  ENABLE_MOCK: import.meta.env.VITE_BAIDU_MOCK === 'true'
};

/**
 * 获取 Token 请求参数
 * @returns {object} Token 请求参数
 */
export function getTokenParams() {
  return {
    grant_type: 'client_credentials',
    client_id: BAIDU_AI_CONFIG.API_KEY,
    client_secret: BAIDU_AI_CONFIG.SECRET_KEY
  };
}

/**
 * 获取图像识别请求参数
 * @param {string} token - Access Token
 * @param {string} imageBase64 - 图像 Base64 编码
 * @returns {object} 图像识别请求参数
 */
export function getImageClassifyParams(token, imageBase64) {
  return {
    access_token: token,
    image: imageBase64
  };
}