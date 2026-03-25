/**
 * 图像识别 Mock 数据
 * @module diagnosis.mock
 */

/**
 * 根据图像 Base64 生成模拟的百度AI图像识别结果
 * @param {string} imageBase64 - 图像 Base64 编码
 * @returns {object} 模拟的图像识别结果
 */
export function getMockImageResult(imageBase64) {
  // 根据 Base64 字符串长度生成不同的模拟结果
  const base64Length = imageBase64.length;
  const random = Math.random();

  // 模拟柑橘黄龙病
  if (base64Length % 3 === 0 || random < 0.3) {
    return {
      result: [
        {
          keyword: '柑橘',
          root: '植物-果实',
          score: 0.95,
          baike_info: {
            description: '柑橘是芸香科柑橘属植物，性喜温暖湿润气候，耐寒性较柚、酸橙、甜橙稍强。'
          }
        },
        {
          keyword: '黄化',
          score: 0.88
        },
        {
          keyword: '叶片',
          score: 0.92
        }
      ],
      result_num: 3,
      log_id: Date.now()
    };
  }

  // 模拟苹果正常
  if (base64Length % 5 === 0 || random < 0.5) {
    return {
      result: [
        {
          keyword: '苹果',
          root: '植物-果实',
          score: 0.98,
          baike_info: {
            description: '苹果是蔷薇科苹果亚科苹果属植物，其树为落叶乔木。苹果的果实富含矿物质和维生素，是人们经常食用的水果之一。'
          }
        },
        {
          keyword: '果实',
          score: 0.96
        },
        {
          keyword: '红色',
          score: 0.93
        }
      ],
      result_num: 3,
      log_id: Date.now()
    };
  }

  // 模拟梨虫害
  if (base64Length % 7 === 0 || random < 0.7) {
    return {
      result: [
        {
          keyword: '梨',
          root: '植物-果实',
          score: 0.94,
          baike_info: {
            description: '梨是蔷薇科梨属植物，多年生落叶乔木果树，叶子卵形，花多白色，果实多汁，可食。'
          }
        },
        {
          keyword: '虫害',
          score: 0.85
        },
        {
          keyword: '叶片',
          score: 0.91
        }
      ],
      result_num: 3,
      log_id: Date.now()
    };
  }

  // 默认模拟结果
  return {
    result: [
      {
        keyword: '果树',
        root: '植物',
        score: 0.90,
        baike_info: {
          description: '果树是指果实可食的树木，是园艺作物的重要组成部分。'
        }
      },
      {
        keyword: '叶片',
        score: 0.88
      },
      {
        keyword: '树枝',
        score: 0.85
      }
    ],
    result_num: 3,
    log_id: Date.now()
  };
}

/**
 * 获取模拟的诊断报告
 * @param {string} imageBase64 - 图像 Base64 编码
 * @returns {object} 模拟的诊断报告
 */
export function getMockDiagnosisResult(imageBase64) {
  const mockResult = getMockImageResult(imageBase64);
  const keywords = mockResult.result.map(r => r.keyword).join(' ').toLowerCase();

  if (keywords.includes('黄化')) {
    return {
      diagnosis: '疑似黄龙病',
      confidence: 0.85,
      description: '叶片出现黄化症状，可能是黄龙病的表现',
      suggestions: [
        '建议采样送检确认',
        '及时挖除病树，防止扩散',
        '加强果园管理，提高树体抗性'
      ],
      raw: mockResult
    };
  }

  if (keywords.includes('虫害')) {
    return {
      diagnosis: '疑似虫害',
      confidence: 0.80,
      description: '发现疑似虫害迹象',
      suggestions: [
        '及时喷施相应杀虫剂',
        '悬挂诱虫板',
        '清理果园落叶，减少虫源'
      ],
      raw: mockResult
    };
  }

  if (keywords.includes('柑橘') || keywords.includes('苹果') || keywords.includes('梨')) {
    return {
      diagnosis: `${keywords.includes('柑橘') ? '柑橘' : keywords.includes('苹果') ? '苹果' : '梨'}正常`,
      confidence: 0.90,
      description: `${keywords.includes('柑橘') ? '柑橘' : keywords.includes('苹果') ? '苹果' : '梨'}生长状况正常`,
      suggestions: [
        '继续保持良好的管理',
        '定期检查树体健康状况',
        '合理浇水施肥'
      ],
      raw: mockResult
    };
  }

  return {
    diagnosis: '无法确定',
    confidence: 0.5,
    description: '无法明确识别病害类型，建议进一步检查',
    suggestions: [
      '请提供更清晰的图片',
      '尝试从不同角度拍摄',
      '咨询专业植保人员'
    ],
    raw: mockResult
  };
}