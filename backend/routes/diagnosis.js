const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * 图像诊断接口
 * @route POST /api/diagnosis/image
 * @group 诊断 - 图像诊断相关接口
 * @param {object} request.body.required - 诊断请求参数
 * @param {string} request.body.image.required - 图像 Base64 编码
 * @returns {object} 200 - 诊断成功
 * @returns {object} 400 - 请求参数错误
 * @returns {object} 500 - 诊断失败
 */
router.post('/image', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: '缺少图像数据' });
    }

    // 模拟诊断延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 从数据库获取诊断数据（这里使用示例数据，实际项目中应该调用AI模型）
    const [diagnoses] = await pool.query(
      'SELECT * FROM disease_info ORDER BY RAND() LIMIT 1'
    );

    if (diagnoses.length === 0) {
      // 如果数据库中没有数据，返回默认诊断结果
      return res.json({
        success: true,
        data: {
          disease: '疑似炭疽病',
          confidence: 0.85,
          symptoms: ['叶片出现褐色斑点', '边缘有黄色晕圈', '严重时叶片脱落'],
          treatment: [
            '使用代森锰锌800倍液喷雾',
            '加强果园通风透光',
            '及时清除病叶病枝'
          ],
          prevention: [
            '定期喷洒保护性杀菌剂',
            '合理修剪，改善通风',
            '加强肥水管理，提高树体抗病能力'
          ]
        }
      });
    }

    const diagnosis = diagnoses[0];
    res.json({
      success: true,
      data: {
        disease: diagnosis.disease_name,
        confidence: diagnosis.confidence || 0.85,
        symptoms: diagnosis.symptoms ? diagnosis.symptoms.split('|') : ['叶片出现异常'],
        treatment: diagnosis.treatment ? diagnosis.treatment.split('|') : ['请咨询专业植保人员'],
        prevention: diagnosis.prevention ? diagnosis.prevention.split('|') : ['定期检查果园']
      }
    });
  } catch (error) {
    console.error('Image diagnosis failed:', error);
    res.status(500).json({
      success: false,
      error: `诊断失败: ${error.message}`
    });
  }
});

/**
 * 批量图像诊断接口
 * @route POST /api/diagnosis/images
 * @group 诊断 - 图像诊断相关接口
 * @param {object} request.body.required - 诊断请求参数
 * @param {Array<string>} request.body.images.required - 图像 Base64 编码列表
 * @returns {object} 200 - 诊断成功
 * @returns {object} 400 - 请求参数错误
 * @returns {object} 500 - 诊断失败
 */
router.post('/images', async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: '缺少图像数据列表' });
    }

    // 模拟批量诊断
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 从数据库获取诊断数据
    const [diagnoses] = await pool.query(
      'SELECT * FROM disease_info ORDER BY RAND() LIMIT ?',
      [Math.min(images.length, 5)]
    );

    const results = images.map((image, index) => {
      const dbDiagnosis = diagnoses[index % diagnoses.length];
      return {
        id: index + 1,
        disease: dbDiagnosis ? dbDiagnosis.disease_name : '疑似炭疽病',
        confidence: 0.8 + (index * 0.05),
        symptoms: dbDiagnosis && dbDiagnosis.symptoms ? dbDiagnosis.symptoms.split('|') : ['叶片出现异常'],
        treatment: dbDiagnosis && dbDiagnosis.treatment ? dbDiagnosis.treatment.split('|') : ['请咨询专业植保人员'],
        prevention: dbDiagnosis && dbDiagnosis.prevention ? dbDiagnosis.prevention.split('|') : ['定期检查果园']
      };
    });

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Batch image diagnosis failed:', error);
    res.status(500).json({
      success: false,
      error: `批量诊断失败: ${error.message}`
    });
  }
});

module.exports = router;