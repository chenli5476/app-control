#!/usr/bin/env python3
"""
Kimi API 服务封装
"""

import os
import json
import logging
from openai import OpenAI
from typing import Optional
from .knowledge_base import KnowledgeBase

logger = logging.getLogger(__name__)

class KimiService:
    def __init__(self):
        """
        初始化 Kimi 服务
        """
        api_key = os.getenv("MOONSHOT_API_KEY")
        if not api_key:
            raise ValueError("MOONSHOT_API_KEY 未配置")
        
        # 关键修复：去掉 base_url 末尾的空格！
        self.client = OpenAI(
            base_url="https://api.moonshot.cn/v1",
            api_key=api_key
        )
        # 使用支持多模态的模型
        self.model = "kimi-k2.5"
        self.knowledge_base = KnowledgeBase()
    
    async def diagnose(self, text: str, image_base64: str = None, crop_type: str = "citrus"):
        """
        诊断果树病虫害
        
        Args:
            text: 用户描述
            image_base64: 图片的 base64 编码
            crop_type: 作物类型
            
        Returns:
            诊断结果
        """
        try:
            # 从知识库获取相关病害信息
            knowledge_info = self._get_knowledge_info(text, crop_type)
            
            # 构建系统提示词
            system_prompt = self._get_system_prompt(crop_type, knowledge_info)
            
            # 构建消息
            messages = [
                {"role": "system", "content": system_prompt}
            ]
            
            # 构建用户消息
            user_content = []
            if text:
                user_content.append({"type": "text", "text": text})
            
            if image_base64:
                user_content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
                })
            
            if not user_content:
                raise ValueError("至少需要提供文字描述或图片")
            
            messages.append({"role": "user", "content": user_content})
            
            # 调用 Kimi API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=1  # kimi-k2.5 模型只允许 temperature=1
            )
            
            # 解析响应
            content = response.choices[0].message.content
            result = json.loads(content)
            
            return result
            
        except Exception as e:
            logger.error(f"Kimi API 调用失败: {str(e)}")
            raise
    
    def _get_knowledge_info(self, text: str, crop_type: str) -> str:
        """
        从知识库获取相关信息
        
        Args:
            text: 用户描述
            crop_type: 作物类型
            
        Returns:
            知识库信息
        """
        if not text:
            return ""
        
        # 提取关键词作为症状
        symptoms = text.split('，')
        matched_diseases = self.knowledge_base.search_by_symptom(symptoms, crop_type)
        
        if not matched_diseases:
            return ""
        
        # 构建知识库信息
        knowledge_info = "【知识库参考】\n"
        for disease in matched_diseases[:3]:  # 最多返回3个匹配的病害
            knowledge_info += f"\n{disease.get('name')} ({disease.get('type')}):\n"
            knowledge_info += f"症状: {'; '.join(disease.get('symptoms', [])[:3])}\n"
            knowledge_info += f"关键特征: {disease.get('key_features', '')}\n"
            knowledge_info += f"防治: {disease.get('prevention', '')}\n"
        
        return knowledge_info
    
    def _get_system_prompt(self, crop_type: str, knowledge_info: str) -> str:
        """
        获取系统提示词
        
        Args:
            crop_type: 作物类型
            knowledge_info: 知识库信息
            
        Returns:
            系统提示词
        """
        crop_name = {
            "citrus": "柑橘",
            "apple": "苹果",
            "pear": "梨"
        }.get(crop_type, "果树")
        
        prompt = f"""你是一位资深果树病理学专家，拥有30年{crop_name}种植经验。

【任务】根据用户提供的症状描述和图片，进行专业诊断。

【诊断要求】
1. 分析症状：仔细观察叶片、果实、枝干的异常表现
2. 给出诊断：明确病害名称、类型（病毒/细菌/真菌/虫害/生理）
3. 置信度评估：根据症状典型程度给出 0-100% 的置信度
4. 鉴别诊断：列出2-3种相似病害，说明排除或确认理由
5. 严重程度：评估对果园的威胁程度（危急/重度/中度/轻度）

【治疗方案】
- 立即措施：紧急处理步骤
- 化学防治：推荐药剂及使用方法
- 农业措施：栽培管理建议
- 生物防治：生物制剂推荐

【特别警告】
如果是黄龙病，必须强调：
- 无药可治，发现即挖除
- 立即报告当地植保站
- 全年防治木虱阻断传播

【回复风格】
- 专业但易懂，像经验丰富的老农技师
- 条理清晰，分点说明
- 对危急情况要强调紧迫性

{knowledge_info}

【输出格式 - 严格JSON】
{{
  "diagnosis": {{
    "primary": {{"name": "病害名", "confidence": 85, "type": "病毒病"}},
    "differential": [
      {{"name": "相似病1", "reason": "排除：xxx"}},
      {{"name": "相似病2", "reason": "确认：xxx"}}
    ]
  }},
  "symptoms": {{
    "observed": ["症状1", "症状2"],
    "key_features": "最关键的识别特征"
  }},
  "severity": "危急",
  "treatment": {{
    "immediate": ["立即执行1", "立即执行2"],
    "chemical": [{{"name": "药剂名", "dosage": "1000倍液", "note": "注意事项"}}],
    "agricultural": ["农业措施1"],
    "biological": ["生物防治1"]
  }},
  "prevention": "长期预防建议",
  "warning": "特别警告"
}}
"""
        
        return prompt
