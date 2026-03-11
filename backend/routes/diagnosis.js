const express = require('express');
const router = express.Router();

// 导入诊断引擎
const { diagnoseImage } = require('../../src/services/diagnosis/engine');

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

    // 调用诊断引擎
    const diagnosis = await diagnoseImage(image);

    res.json({
      success: true,
      data: diagnosis
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

    // 导入批量诊断函数
    const { diagnoseImages } = require('../../src/services/diagnosis/engine');
    
    // 调用批量诊断
    const diagnoses = await diagnoseImages(images);

    res.json({
      success: true,
      data: diagnoses
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