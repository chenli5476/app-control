#!/usr/bin/env python3
"""
病虫害知识库服务
"""

import json
import os
from typing import List, Dict, Optional
import logging

# 配置日志
logger = logging.getLogger(__name__)

class KnowledgeBase:
    def __init__(self):
        """
        初始化知识库
        """
        self.data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "diseases.json")
        self.diseases = self._load_diseases()
    
    def _load_diseases(self) -> List[Dict]:
        """
        加载病害数据
        
        Returns:
            病害列表
        """
        try:
            with open(self.data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data.get('diseases', [])
        except Exception as e:
            logger.error(f"加载知识库失败: {str(e)}")
            return []
    
    def search_by_crop(self, crop_type: str) -> List[Dict]:
        """
        根据作物类型搜索病害
        
        Args:
            crop_type: 作物类型
            
        Returns:
            病害列表
        """
        crop_map = {
            "citrus": "柑橘",
            "apple": "苹果",
            "pear": "梨"
        }
        crop_name = crop_map.get(crop_type, crop_type)
        
        return [disease for disease in self.diseases if disease.get('category') == crop_name]
    
    def search_by_symptom(self, symptoms: List[str], crop_type: str = "citrus") -> List[Dict]:
        """
        根据症状搜索病害
        
        Args:
            symptoms: 症状列表
            crop_type: 作物类型
            
        Returns:
            匹配的病害列表
        """
        crop_diseases = self.search_by_crop(crop_type)
        matched_diseases = []
        
        for disease in crop_diseases:
            disease_symptoms = disease.get('symptoms', [])
            match_count = 0
            
            for symptom in symptoms:
                for disease_symptom in disease_symptoms:
                    if symptom in disease_symptom:
                        match_count += 1
                        break
            
            if match_count > 0:
                disease['match_score'] = match_count
                matched_diseases.append(disease)
        
        # 按匹配度排序
        matched_diseases.sort(key=lambda x: x.get('match_score', 0), reverse=True)
        return matched_diseases
    
    def get_disease_by_name(self, name: str) -> Optional[Dict]:
        """
        根据名称获取病害信息
        
        Args:
            name: 病害名称
            
        Returns:
            病害信息
        """
        for disease in self.diseases:
            if disease.get('name') == name:
                return disease
        return None
    
    def get_all_diseases(self) -> List[Dict]:
        """
        获取所有病害
        
        Returns:
            病害列表
        """
        return self.diseases
