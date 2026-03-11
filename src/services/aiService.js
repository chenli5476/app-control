/**
 * 统一AI服务入口
 * @module aiService
 */

import { message } from 'antd';

// 将 base64 转换为 File 对象
function base64ToFile(base64String, filename = 'image.jpg') {
  // 移除 data:image/jpeg;base64, 前缀
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// 调用本地 FastAPI 后端
async function diagnoseWithAI(text, imageBase64, cropType = 'citrus') {
  const formData = new FormData();
  
  if (text) formData.append('text', text);
  
  // 如果有图片，将 base64 转为 File 对象
  if (imageBase64) {
    const imageFile = base64ToFile(imageBase64, 'upload.jpg');
    formData.append('image', imageFile);
  }
  
  formData.append('crop_type', cropType);
  
  const response = await fetch('http://localhost:8000/api/v1/diagnose', {
    method: 'POST',
    body: formData
    // 注意：不要设置 Content-Type，让浏览器自动设置
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || '诊断服务暂时不可用');
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || '诊断失败');
  }
  
  return result;
}

/**
 * 统一AI服务类
 */
class AIService {
  async diagnose(text, imageBase64, cropType = 'citrus') {
    try {
      // 调用本地后端
      const result = await diagnoseWithAI(text, imageBase64, cropType);
      
      return {
        success: true,
        mode: 'ai',
        data: result.data  // 直接返回后端的数据结构
      };
    } catch (error) {
      console.error('AI诊断错误:', error);
      message.error('AI服务连接失败，切换到演示模式');
      // 降级到演示模式
      return this.getMockResponse(text);
    }
  }
  
  // 演示模式（备用）
  getMockResponse(text) {
    return {
      success: true,
      mode: 'demo',
      data: {
        diagnosis: {
          primary: { name: '演示模式', confidence: 80, type: '未知' }
        },
        symptoms: { observed: [], key_features: '' },
        severity: '未知',
        treatment: { immediate: [], chemical: [], agricultural: [], biological: [] },
        prevention: '',
        warning: 'AI服务未连接，显示演示数据'
      }
    };
  }
}

// 导出单例
export default new AIService();