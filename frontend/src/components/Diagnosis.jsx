import React, { useState } from 'react';
import { Upload, Button, message, Card, Progress, Result, Typography, List, Tag } from 'antd';
import { UploadOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { diagnoseImage } from '../services/diagnosis/engine';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const Diagnosis = () => {
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file) => {
    setLoading(true);
    setProgress(0);
    setDiagnosis(null);

    try {
      // 读取文件为Base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64String = e.target.result;
          setImageUrl(base64String);
          
          // 模拟上传进度
          let currentProgress = 0;
          const interval = setInterval(() => {
            currentProgress += 10;
            setProgress(currentProgress);
            if (currentProgress >= 90) {
              clearInterval(interval);
            }
          }, 100);

          // 调用诊断服务
          const result = await diagnoseImage(base64String);
          setDiagnosis(result);
          setProgress(100);
          
          // 清除进度条
          setTimeout(() => setProgress(0), 500);
        } catch (error) {
          message.error('诊断失败，请稍后重试');
          console.error('Diagnosis error:', error);
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        message.error('读取图片失败');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      message.error('上传失败，请稍后重试');
      console.error('Upload error:', error);
      setLoading(false);
    }

    // 阻止默认上传行为
    return false;
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    beforeUpload: handleUpload,
    showUploadList: false,
  };

  return (
    <div className="site-layout-content">
      <Title level={2}>AI果树医生</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽图片到此处上传</p>
          <p className="ant-upload-hint">
            支持 PNG、JPG、JPEG、BMP 格式，最大 4MB
          </p>
        </Dragger>
      </Card>

      {progress > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <Progress percent={progress} status="active" />
        </Card>
      )}

      {imageUrl && (
        <Card title="上传的图片" style={{ marginBottom: 24 }}>
          <img 
            src={imageUrl} 
            alt="上传的图片" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '400px', 
              objectFit: 'contain' 
            }} 
          />
        </Card>
      )}

      {diagnosis && (
        <Card title="诊断结果">
          <Result
            status={diagnosis.confidence > 0.7 ? "success" : "warning"}
            title={diagnosis.diagnosis}
            subTitle={`置信度: ${(diagnosis.confidence * 100).toFixed(1)}%`}
            extra={[
              <Button key="refresh" type="primary" onClick={() => setDiagnosis(null)}>
                重新诊断
              </Button>
            ]}
          />
          
          <div style={{ marginTop: 24 }}>
            <Title level={4}>症状描述</Title>
            <Paragraph>{diagnosis.description}</Paragraph>
            
            <Title level={4}>建议措施</Title>
            <List
              dataSource={diagnosis.suggestions}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <CheckCircleOutlined style={{ color: '#4A6741' }} />
                    }
                    title={item}
                  />
                </List.Item>
              )}
            />
          </div>
          
          {diagnosis.raw && (
            <div style={{ marginTop: 24 }}>
              <Title level={4}>原始识别结果</Title>
              <List
                dataSource={diagnosis.raw.result}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div>
                          <Text strong>{item.keyword}</Text>
                          <Tag style={{ marginLeft: 8 }}>{(item.score * 100).toFixed(1)}%</Tag>
                        </div>
                      }
                      description={item.baike_info?.description}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Diagnosis;