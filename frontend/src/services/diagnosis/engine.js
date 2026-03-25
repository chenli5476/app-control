/**
 * 果树病害诊断引擎
 * @module diagnosis.engine
 */

/**
 * 将百度AI图像识别结果转换为诊断报告
 * @param {object} baiduResult - 百度AI图像识别结果
 * @returns {object} 诊断报告
 */
export function convertToDiagnosis(baiduResult) {
  if (!baiduResult || !baiduResult.result) {
    return defaultDiagnosis(baiduResult);
  }

  const keywords = baiduResult.result.map(r => r.keyword).join(' ').toLowerCase();
  const scores = baiduResult.result.reduce((sum, item) => sum + (item.score || 0), 0) / baiduResult.result.length;

  // 关键词匹配规则
  if (keywords.includes('黄') || keywords.includes('yellow')) {
    return {
      diagnosis: '疑似黄龙病',
      confidence: Math.min(0.85, scores),
      description: '叶片出现黄化症状，可能是黄龙病的表现',
      suggestions: [
        '建议采样送检确认',
        '及时挖除病树，防止扩散',
        '加强果园管理，提高树体抗性'
      ],
      raw: baiduResult
    };
  }

  if (keywords.includes('病') || keywords.includes('disease')) {
    return {
      diagnosis: '疑似病害',
      confidence: Math.min(0.75, scores),
      description: '叶片或果实出现异常症状，可能感染病害',
      suggestions: [
        '建议咨询专业植保人员',
        '加强果园通风透光',
        '合理施肥，增强树势'
      ],
      raw: baiduResult
    };
  }

  if (keywords.includes('虫') || keywords.includes('insect')) {
    return {
      diagnosis: '疑似虫害',
      confidence: Math.min(0.80, scores),
      description: '发现疑似虫害迹象',
      suggestions: [
        '及时喷施相应杀虫剂',
        '悬挂诱虫板',
        '清理果园落叶，减少虫源'
      ],
      raw: baiduResult
    };
  }

  if (keywords.includes('柑橘') || keywords.includes('citrus')) {
    return {
      diagnosis: '柑橘正常',
      confidence: Math.min(0.90, scores),
      description: '柑橘生长状况正常',
      suggestions: [
        '继续保持良好的管理',
        '定期检查树体健康状况',
        '合理浇水施肥'
      ],
      raw: baiduResult
    };
  }

  if (keywords.includes('苹果') || keywords.includes('apple')) {
    return {
      diagnosis: '苹果正常',
      confidence: Math.min(0.90, scores),
      description: '苹果生长状况正常',
      suggestions: [
        '继续保持良好的管理',
        '定期检查树体健康状况',
        '合理浇水施肥'
      ],
      raw: baiduResult
    };
  }

  if (keywords.includes('梨') || keywords.includes('pear')) {
    return {
      diagnosis: '梨正常',
      confidence: Math.min(0.90, scores),
      description: '梨生长状况正常',
      suggestions: [
        '继续保持良好的管理',
        '定期检查树体健康状况',
        '合理浇水施肥'
      ],
      raw: baiduResult
    };
  }

  return defaultDiagnosis(baiduResult);
}

/**
 * 默认诊断结果
 * @param {object} baiduResult - 百度AI图像识别结果
 * @returns {object} 默认诊断报告
 */
export function defaultDiagnosis(baiduResult) {
  return {
    diagnosis: '无法确定',
    confidence: 0.5,
    description: '无法明确识别病害类型，建议进一步检查',
    suggestions: [
      '请提供更清晰的图片',
      '尝试从不同角度拍摄',
      '咨询专业植保人员'
    ],
    raw: baiduResult
  };
}

/**
 * 诊断图像
 * @param {string} imageBase64 - 图像 Base64 编码
 * @returns {Promise<object>} 诊断报告
 */
export async function diagnoseImage(imageBase64) {
  try {
    // 导入图像服务
    const { recognizeImage } = await import('../baidu/imageService');
    
    // 调用图像识别
    const baiduResult = await recognizeImage(imageBase64);
    
    // 转换为诊断报告
    return convertToDiagnosis(baiduResult);
  } catch (error) {
    console.error('Diagnosis failed:', error);
    return {
      diagnosis: '诊断失败',
      confidence: 0,
      description: `诊断过程中出现错误: ${error.message}`,
      suggestions: [
        '请检查网络连接',
        '稍后重试',
        '联系技术支持'
      ],
      raw: null
    };
  }
}

/**
 * 批量诊断图像
 * @param {Array<string>} imageBase64List - 图像 Base64 编码列表
 * @returns {Promise<Array<object>>} 诊断报告列表
 */
export async function diagnoseImages(imageBase64List) {
  const results = [];
  
  for (const imageBase64 of imageBase64List) {
    try {
      const result = await diagnoseImage(imageBase64);
      results.push(result);
    } catch (error) {
      console.error('Failed to diagnose image:', error);
      results.push({
        diagnosis: '诊断失败',
        confidence: 0,
        description: `诊断过程中出现错误: ${error.message}`,
        suggestions: [
          '请检查网络连接',
          '稍后重试',
          '联系技术支持'
        ],
        raw: null
      });
    }
  }
  
  return results;
}