import React, { useState } from 'react'
import { Card, Tabs, List, Avatar, Button, Input, Select, Tag, Modal, Row, Col } from 'antd'
import { SearchOutlined, BookOutlined, VideoCameraOutlined, CalendarOutlined, MessageOutlined } from '@ant-design/icons'

const { Option } = Select
const { TabPane } = Tabs
const { Search } = Input

// 模拟数据
const mockArticles = [
  {
    id: 1,
    title: '苹果种植技术指南',
    author: '农业专家',
    date: '2026-02-20',
    category: '种植技术',
    views: 1200,
    content: '苹果是一种广泛种植的水果，具有很高的经济价值。本文将介绍苹果的种植技术，包括品种选择、定植、土肥水管理、病虫害防治等方面的内容...'
  },
  {
    id: 2,
    title: '梨树病虫害防治手册',
    author: '农业专家',
    date: '2026-02-15',
    category: '病虫害防治',
    views: 800,
    content: '梨树常见的病虫害有梨木虱、蚜虫、褐斑病等。本文将详细介绍这些病虫害的识别方法和防治措施...'
  },
  {
    id: 3,
    title: '桃树修剪技术',
    author: '农业专家',
    date: '2026-02-10',
    category: '修剪技术',
    views: 600,
    content: '桃树修剪是桃树管理的重要环节，合理的修剪可以提高桃树的产量和品质。本文将介绍桃树的修剪技术...'
  }
]

const mockVideos = [
  {
    id: 1,
    title: '苹果疏花疏果技术',
    author: '农业专家',
    date: '2026-02-18',
    duration: '15:30',
    views: 500
  },
  {
    id: 2,
    title: '梨树病虫害防治实战',
    author: '农业专家',
    date: '2026-02-12',
    duration: '20:15',
    views: 300
  }
]

const mockCalendar = [
  {
    id: 1,
    date: '2026-03-05',
    solarTerm: '惊蛰',
    activities: ['苹果树病虫害防治', '梨树施肥']
  },
  {
    id: 2,
    date: '2026-03-20',
    solarTerm: '春分',
    activities: ['桃树修剪', '葡萄上架']
  },
  {
    id: 3,
    date: '2026-04-04',
    solarTerm: '清明',
    activities: ['苹果树疏花', '梨树疏果']
  }
]

const mockCommunity = [
  {
    id: 1,
    title: '苹果树叶子发黄怎么办？',
    author: '果农小王',
    date: '2026-02-25',
    replies: 5,
    views: 200
  },
  {
    id: 2,
    title: '梨树产量低是什么原因？',
    author: '果农老李',
    date: '2026-02-20',
    replies: 3,
    views: 150
  }
]

const KnowledgeBase = () => {
  const [activeTab, setActiveTab] = useState('articles')
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [publishModalVisible, setPublishModalVisible] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [questionTitle, setQuestionTitle] = useState('')
  const [questionContent, setQuestionContent] = useState('')
  const [communityData, setCommunityData] = useState(mockCommunity)
  const [replies, setReplies] = useState({})
  const [replyContent, setReplyContent] = useState('')

  // 查看文章详情
  const viewArticle = (article) => {
    setSelectedArticle(article)
    setModalVisible(true)
  }
  
  // 打开发布问题模态框
  const handlePublishQuestion = () => {
    setPublishModalVisible(true)
  }
  
  // 提交问题
  const handleSubmitQuestion = () => {
    if (!questionTitle || !questionContent) return
    
    const newQuestion = {
      id: communityData.length + 1,
      title: questionTitle,
      author: '当前用户',
      date: new Date().toISOString().split('T')[0],
      replies: 0,
      views: 0
    }
    
    setCommunityData([newQuestion, ...communityData])
    setQuestionTitle('')
    setQuestionContent('')
    setPublishModalVisible(false)
  }
  
  // 查看问题详情
  const viewQuestion = (question) => {
    setSelectedQuestion(question)
    setModalVisible(true)
  }
  
  // 提交回复
  const handleSubmitReply = () => {
    if (!replyContent || !selectedQuestion) return
    
    const questionId = selectedQuestion.id
    const newReply = {
      id: Date.now(),
      author: '当前用户',
      date: new Date().toISOString().split('T')[0],
      content: replyContent
    }
    
    setReplies(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), newReply]
    }))
    
    // 更新回复数
    setCommunityData(prev => prev.map(q => 
      q.id === questionId ? { ...q, replies: q.replies + 1 } : q
    ))
    
    setReplyContent('')
  }

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="文章教程" key="articles">
          <Card title="种植技术指南">
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Search placeholder="搜索文章" style={{ width: '100%' }} />
                </Col>
                <Col span={12}>
                  <Select style={{ width: '100%' }} placeholder="按分类筛选">
                    <Option value="all">全部</Option>
                    <Option value="种植技术">种植技术</Option>
                    <Option value="病虫害防治">病虫害防治</Option>
                    <Option value="修剪技术">修剪技术</Option>
                  </Select>
                </Col>
              </Row>
            </div>
            <List
              dataSource={mockArticles}
              renderItem={(article) => (
                <List.Item
                  key={article.id}
                  actions={[
                    <span key="views">{article.views} 浏览</span>,
                    <Button key="view" type="link" onClick={() => viewArticle(article)}>查看详情</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<BookOutlined />} />}
                    title={
                      <div>
                        <span>{article.title}</span>
                        <Tag style={{ marginLeft: 8 }}>{article.category}</Tag>
                      </div>
                    }
                    description={`${article.author} · ${article.date}`}
                  />
                  <div>{article.content.substring(0, 100)}...</div>
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="视频教程" key="videos">
          <Card title="专家讲座视频">
            <List
              dataSource={mockVideos}
              renderItem={(video) => (
                <List.Item
                  key={video.id}
                  actions={[
                    <span key="duration">{video.duration}</span>,
                    <span key="views">{video.views} 浏览</span>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<VideoCameraOutlined />} />}
                    title={video.title}
                    description={`${video.author} · ${video.date}`}
                  />
                  <Button type="primary">播放</Button>
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="农事日历" key="calendar">
          <Card title="农事日历">
            <List
              dataSource={mockCalendar}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<CalendarOutlined />} />}
                    title={
                      <div>
                        <span>{item.date}</span>
                        <Tag style={{ marginLeft: 8 }}>{item.solarTerm}</Tag>
                      </div>
                    }
                    description={item.activities.map(activity => (
                      <div key={activity}>{activity}</div>
                    ))}
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="社区交流" key="community">
          <Card title="果农问答社区">
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<MessageOutlined />} style={{ width: '100%' }} onClick={handlePublishQuestion}>
                发布问题
              </Button>
            </div>
            <List
              dataSource={communityData}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <span key="replies">{item.replies} 回复</span>,
                    <span key="views">{item.views} 浏览</span>,
                    <Button key="view" type="link" onClick={() => viewQuestion(item)}>查看详情</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{item.author.substring(0, 1)}</Avatar>}
                    title={item.title}
                    description={`${item.author} · ${item.date}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 发布问题模态框 */}
      <Modal
        title="发布问题"
        open={publishModalVisible}
        onCancel={() => setPublishModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPublishModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmitQuestion}>
            发布
          </Button>
        ]}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="请输入问题标题"
            value={questionTitle}
            onChange={(e) => setQuestionTitle(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Input.TextArea
            rows={6}
            placeholder="请详细描述您的问题"
            value={questionContent}
            onChange={(e) => setQuestionContent(e.target.value)}
          />
        </div>
      </Modal>
      
      {/* 详情模态框 */}
      <Modal
        title={selectedArticle?.title || selectedQuestion?.title}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedArticle && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Tag>{selectedArticle.category}</Tag>
              <span style={{ marginLeft: 16 }}>{selectedArticle.author}</span>
              <span style={{ marginLeft: 16 }}>{selectedArticle.date}</span>
              <span style={{ marginLeft: 16 }}>{selectedArticle.views} 浏览</span>
            </div>
            <div style={{ lineHeight: 1.8 }}>
              {selectedArticle.content}
              <p style={{ marginTop: 16 }}>...</p>
              <p style={{ marginTop: 16 }}>本文由农业专家撰写，仅供参考。如有具体问题，请咨询当地农业技术人员。</p>
            </div>
          </div>
        )}
        
        {selectedQuestion && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ marginRight: 16 }}>{selectedQuestion.author}</span>
              <span style={{ marginRight: 16 }}>{selectedQuestion.date}</span>
              <span>{selectedQuestion.views} 浏览</span>
            </div>
            <div style={{ marginBottom: 24, lineHeight: 1.8 }}>
              <h3>{selectedQuestion.title}</h3>
              <p>问题内容：{questionContent}</p>
            </div>
            
            {/* 回复列表 */}
            <div style={{ marginBottom: 16 }}>
              <h4>回复 ({replies[selectedQuestion.id]?.length || 0})</h4>
              {replies[selectedQuestion.id]?.map(reply => (
                <div key={reply.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ marginBottom: 8 }}>
                    <Avatar>{reply.author.substring(0, 1)}</Avatar>
                    <span style={{ marginLeft: 8 }}>{reply.author}</span>
                    <span style={{ marginLeft: 16 }}>{reply.date}</span>
                  </div>
                  <div>{reply.content}</div>
                </div>
              )) || <p>暂无回复</p>}
            </div>
            
            {/* 回复输入框 */}
            <div>
              <h4>发表回复</h4>
              <Input.TextArea
                rows={4}
                placeholder="请输入您的回复"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                style={{ marginBottom: 16 }}
              />
              <Button type="primary" onClick={handleSubmitReply}>提交回复</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default KnowledgeBase