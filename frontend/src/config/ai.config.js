// config/ai.config.js
export default {
  // 后端API配置
  api: {
    baseUrl: 'http://localhost:3001',
    timeout: 5000
  },
  
  // 图像服务
  image: {
    useMock: false,
    apiKey: 'qHtAgBRNW4PzKvMQTAnFJFBP',
    secretKey: 'rdZA5jpaQ5g7T07VCkaqrS66xDWtDqu9'
  },
  
  // 对话服务
  chat: {
    useMock: false,
    model: 'ernie-lite',
    apiKey: 'bce-v3/ALTAK-UiN3u9DWJJPpANBGhjiJB/5d23320e5a68bcb05f48a2a651bf744221420977'
  }
};
