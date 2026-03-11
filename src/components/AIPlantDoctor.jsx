import React, { useState } from 'react'
import { Upload, Button, Input, message, Tag, Card, Tabs, List, Avatar, Modal, Typography } from 'antd'
import { UploadOutlined, SendOutlined, StarOutlined, PhoneOutlined, VideoCameraOutlined, CloseOutlined, PaperClipOutlined } from '@ant-design/icons'
import aiService from '../services/aiService'
import './AIPlantDoctor.css'

// 添加 CSS 动画样式
const style = document.createElement('style')
style.textContent = `
  @keyframes pulse {
    0% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
  }
`
document.head.appendChild(style)

const { TextArea } = Input
const { TabPane } = Tabs
const { Title, Text, Paragraph } = Typography

// 模拟历史记录数据
const mockHistory = [
  {
    id: 1,
    question: '我的苹果树叶发黄怎么办？',
    answer: '根据描述，您的苹果树可能存在缺氮或缺铁的情况。建议：1. 适量施用氮肥；2. 检查土壤pH值，如偏碱性可施用硫酸亚铁；3. 确保合理浇水，避免积水。',
    date: '2026-02-25',
    tags: ['病虫害', '施肥'],
    isStarred: true
  },
  {
    id: 2,
    question: '梨树开花后怎么管理？',
    answer: '梨树开花后管理要点：1. 疏花疏果：去除过多的花和果实，保证果实品质；2. 病虫害防治：注意防治梨木虱、蚜虫等；3. 合理施肥：花期后追施磷钾肥；4. 保持土壤湿润。',
    date: '2026-02-20',
    tags: ['种植技术', '施肥'],
    isStarred: false
  }
]

const AIPlantDoctor = () => {
  const [activeTab, setActiveTab] = useState('diagnosis')
  const [diagnosisMessages, setDiagnosisMessages] = useState([])
  const [qaMessages, setQaMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [historyData, setHistoryData] = useState(mockHistory)
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  // 上传图片
  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    beforeUpload: (file) => {
      // 读取文件为Base64
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target.result)
      }
      reader.onerror = () => {
        message.error('读取图片失败')
      }
      reader.readAsDataURL(file)

      // 阻止默认上传行为
      return false
    },
    showUploadList: false,
  }

  // 发送消息
  const handleSend = async () => {
    if (!inputText && !selectedImage) return

    // 保存当前值
    const currentText = inputText
    const currentImage = selectedImage
    
    // 立即清空输入框（关键修复！）
    setInputText('')
    setSelectedImage(null)

    // 添加用户消息
    const userMessage = {
      type: 'user',
      content: currentText,
      image: currentImage
    }

    // 根据当前标签页选择消息状态
    const isDiagnosisTab = activeTab === 'diagnosis'
    if (isDiagnosisTab) {
      setDiagnosisMessages(prev => [...prev, userMessage])
    } else {
      setQaMessages(prev => [...prev, userMessage])
    }

    // 添加"思考中"消息
    const thinkingMessage = {
      type: 'ai',
      content: '',
      isThinking: true
    }
    
    if (isDiagnosisTab) {
      setDiagnosisMessages(prev => [...prev, thinkingMessage])
    } else {
      setQaMessages(prev => [...prev, thinkingMessage])
    }

    setLoading(true)
    try {
      // 调用新的诊断方法
      const diagnosisResult = await aiService.diagnose(currentText, currentImage)
      
      // 移除"思考中"消息，添加真实回复
      const aiMessage = {
        type: 'ai',
        mode: diagnosisResult.mode,
        data: diagnosisResult.data,
        content: diagnosisResult.data.treatment?.immediate?.join('\n') || diagnosisResult.data.warning || '诊断完成'
      }

      if (isDiagnosisTab) {
        setDiagnosisMessages(prev => 
          prev.filter(m => !m.isThinking).concat(aiMessage)
        )
      } else {
        setQaMessages(prev => 
          prev.filter(m => !m.isThinking).concat(aiMessage)
        )
      }

      message.success('诊断完成')
    } catch (error) {
      console.error('诊断失败:', error)
      message.error('诊断失败，请重试')

      // 添加错误回复
      const errorMessage = {
        type: 'ai',
        content: '抱歉，我暂时无法诊断这个问题，请稍后重试。'
      }

      if (isDiagnosisTab) {
        setDiagnosisMessages(prev => 
          prev.filter(m => !m.isThinking).concat(errorMessage)
        )
      } else {
        setQaMessages(prev => 
          prev.filter(m => !m.isThinking).concat(errorMessage)
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // 收藏/取消收藏
  const toggleStar = (id) => {
    setHistoryData(historyData.map(item => 
      item.id === id ? { ...item, isStarred: !item.isStarred } : item
    ))
  }

  // 图片预览组件（带删除按钮）
  const ImagePreview = ({ src, onDelete }) => {
    return (
      <div style={{ position: 'relative', marginBottom: 12, display: 'inline-block' }}>
        <img 
          src={src} 
          alt="预览" 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '200px', 
            objectFit: 'contain', 
            borderRadius: 4 
          }} 
        />
        <Button 
          icon={<CloseOutlined />} 
          size="small" 
          style={{ 
            position: 'absolute', 
            top: -8, 
            right: -8, 
            backgroundColor: 'white', 
            border: '1px solid #d9d9d9',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }} 
          onClick={onDelete}
        />
      </div>
    )
  }

  // 已发送图片组件（不带删除按钮）
  const SentImage = ({ src }) => {
    return (
      <div style={{ marginBottom: 12, display: 'inline-block' }}>
        <img 
          src={src} 
          alt="已发送" 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '200px', 
            objectFit: 'contain', 
            borderRadius: 4 
          }} 
        />
      </div>
    )
  }

  return (
    <div className="ai-plant-doctor">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="症状诊断" key="diagnosis">
          <Card title="果树症状诊断">
            <Card title="诊断对话" style={{ marginTop: 0 }}>
              <div className="chat-history">
                {diagnosisMessages.map((item, index) => (
                  <div key={index} className={`chat-message ${item.type}`}>
                    <Avatar style={{ margin: '0 8px' }}>
                      {item.type === 'user' ? '我' : 'AI'}
                    </Avatar>
                    <div className={`chat-bubble ${item.type}`}>
                      {item.image && <SentImage src={item.image} />}
                      
                      {/* 显示模式标签 */}
                      {item.type === 'ai' && !item.isThinking && (
                        item.mode === 'demo' ? (
                          <Tag color="orange" style={{ marginBottom: 8 }}>【演示模式】</Tag>
                        ) : (
                          <Tag color="green" style={{ marginBottom: 8 }}>【AI诊断】</Tag>
                        )
                      )}
                      
                      {/* 思考中状态 */}
                      {item.isThinking ? (
                        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0' }}>
                          <div style={{ display: 'flex', gap: '8px', marginRight: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1890ff', animation: 'pulse 1.5s infinite' }}></div>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1890ff', animation: 'pulse 1.5s infinite 0.2s' }}></div>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1890ff', animation: 'pulse 1.5s infinite 0.4s' }}></div>
                          </div>
                          <Text type="secondary">AI 正在分析中...</Text>
                        </div>
                      ) : (
                        <>
                          {/* 诊断结果展示 */}
                          {item.data && (
                            <div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                                  {item.data.diagnosis?.primary?.name || '未知病害'}
                                </Text>
                                <Tag color={item.data.severity === '危急' ? 'red' : 'blue'} style={{ marginLeft: 8 }}>
                                  {item.data.severity || '未知'}
                                </Tag>
                              </div>
                              
                              <div style={{ marginBottom: 8 }}>
                                <Text type="secondary">置信度: {item.data.diagnosis?.primary?.confidence || 0}%</Text>
                              </div>
                              
                              {item.data.symptoms?.key_features && (
                                <div style={{ marginBottom: 8, padding: 8, backgroundColor: '#f6ffed', borderRadius: 4 }}>
                                  <Text strong>关键症状：</Text>
                                  <Text>{item.data.symptoms.key_features}</Text>
                                </div>
                              )}
                              
                              {item.data.warning && (
                                <div style={{ marginBottom: 8, padding: 8, backgroundColor: '#fff2f0', borderRadius: 4, border: '1px solid #ffccc7' }}>
                                  <Text type="danger" strong>⚠️ {item.data.warning}</Text>
                                </div>
                              )}
                              
                              {item.data.treatment?.immediate?.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                  <Text strong>紧急措施：</Text>
                                  <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                                    {item.data.treatment.immediate.map((action, i) => (
                                      <li key={i}><Text>{action}</Text></li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* 纯文本内容（兼容旧数据） */}
                          {!item.data && item.content}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="input-area">
                {selectedImage && (
                  <ImagePreview 
                    src={selectedImage} 
                    onDelete={() => setSelectedImage(null)} 
                  />
                )}
                <div className="input-row">
                  <Input
                    placeholder="描述症状或上传图片..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onPressEnter={handleSend}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Upload {...uploadProps}>
                    <Button icon={<PaperClipOutlined />} />
                  </Upload>
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />} 
                    onClick={handleSend}
                    loading={loading}
                  >
                    发送
                  </Button>
                </div>
              </div>
            </Card>
          </Card>
        </TabPane>

        <TabPane tab="知识问答" key="knowledge">
          <Card title="种植知识问答">
            <div className="chat-history">
              {qaMessages.map((item, index) => (
                <div key={index} className={`chat-message ${item.type}`}>
                  <Avatar style={{ margin: '0 8px' }}>
                    {item.type === 'user' ? '我' : 'AI'}
                  </Avatar>
                  <div className={`chat-bubble ${item.type}`}>
                    {item.image && (
                      <SentImage src={item.image} />
                    )}
                    
                    {/* 思考中状态 */}
                    {item.isThinking ? (
                      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0' }}>
                        <div style={{ display: 'flex', gap: '8px', marginRight: '12px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1890ff', animation: 'pulse 1.5s infinite' }}></div>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1890ff', animation: 'pulse 1.5s infinite 0.2s' }}></div>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1890ff', animation: 'pulse 1.5s infinite 0.4s' }}></div>
                        </div>
                        <Text type="secondary">AI 正在分析中...</Text>
                      </div>
                    ) : (
                      <>
                        {item.type === 'ai' && <Tag color="blue" style={{ marginBottom: 8 }}>【演示模式】</Tag>}
                        {item.content}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="input-area">
              {selectedImage && (
                <ImagePreview 
                  src={selectedImage} 
                  onDelete={() => setSelectedImage(null)} 
                />
              )}
              <div className="input-row">
                <Input
                  placeholder="输入问题...例如：如何给苹果树施肥？"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onPressEnter={handleSend}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Upload {...uploadProps}>
                  <Button icon={<PaperClipOutlined />} />
                </Upload>
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={handleSend}
                  loading={loading}
                >
                  发送
                </Button>
              </div>
            </div>
          </Card>
        </TabPane>

        <TabPane tab="历史记录" key="history">
          <Card title="问答历史">
            <List
              dataSource={historyData}
              itemLayout="horizontal"
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button 
                      icon={<StarOutlined style={{ color: item.isStarred ? '#fadb14' : undefined }} />} 
                      onClick={() => toggleStar(item.id)}
                    />,
                    <Button type="link" onClick={() => setModalVisible(true)}>
                      查看详情
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{item.question.substring(0, 1)}</Avatar>}
                    title={item.question}
                    description={
                      <div>
                        <div style={{ marginBottom: 4 }}>{item.answer.substring(0, 50)}...</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {item.date} {item.tags.map(tag => (
                            <span key={tag} style={{ marginLeft: 8, padding: '0 8px', backgroundColor: '#f0f0f0', borderRadius: 12 }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="专家咨询" key="expert">
          <Card title="专家咨询">
            <div style={{ textAlign: 'center', padding: 48 }}>
              <h3>AI无法解决您的问题？</h3>
              <p style={{ marginBottom: 24 }}>预约农业专家进行一对一咨询</p>
              <Button type="primary" icon={<PhoneOutlined />} style={{ marginRight: 16 }}>
                电话咨询
              </Button>
              <Button type="primary" icon={<VideoCameraOutlined />}>
                视频咨询
              </Button>
            </div>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="问答详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <div style={{ lineHeight: 1.8 }}>
          <h4>问题：</h4>
          <p>我的苹果树叶发黄怎么办？</p>
          <h4 style={{ marginTop: 16 }}>回答：</h4>
          <p>根据描述，您的苹果树可能存在缺氮或缺铁的情况。建议：1. 适量施用氮肥；2. 检查土壤pH值，如偏碱性可施用硫酸亚铁；3. 确保合理浇水，避免积水。</p>
          <h4 style={{ marginTop: 16 }}>标签：</h4>
          <div>
            <span style={{ marginRight: 8, padding: '0 8px', backgroundColor: '#f0f0f0', borderRadius: 12 }}>病虫害</span>
            <span style={{ marginRight: 8, padding: '0 8px', backgroundColor: '#f0f0f0', borderRadius: 12 }}>施肥</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AIPlantDoctor