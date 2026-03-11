/**
 * Base64 处理工具
 * @module base64
 */

/**
 * 清洗 Base64 字符串，去掉 data:image 前缀
 * @param {string} base64String - 原始 Base64 字符串
 * @returns {string} 清洗后的 Base64 字符串
 */
export function cleanBase64(base64String) {
  // 去掉 data:image/xxx;base64, 前缀
  return base64String.replace(/^data:image\/\w+;base64,/, '');
}

/**
 * URL 编码字符串
 * @param {string} str - 要编码的字符串
 * @returns {string} 编码后的字符串
 */
export function urlEncode(str) {
  return encodeURIComponent(str);
}

/**
 * 检查 Base64 字符串是否有效
 * @param {string} base64String - 要检查的 Base64 字符串
 * @returns {boolean} 是否有效
 */
export function isValidBase64(base64String) {
  if (!base64String || typeof base64String !== 'string') {
    return false;
  }
  const clean = cleanBase64(base64String);
  try {
    return btoa(atob(clean)) === clean;
  } catch (e) {
    return false;
  }
}

/**
 * 获取 Base64 字符串的大小（字节）
 * @param {string} base64String - Base64 字符串
 * @returns {number} 大小（字节）
 */
export function getBase64Size(base64String) {
  const clean = cleanBase64(base64String);
  return Math.ceil((clean.length * 3) / 4);
}