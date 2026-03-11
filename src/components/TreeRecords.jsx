import React, { useState } from 'react'
import { Card, Tabs, Form, Input, Select, DatePicker, Table, Button, Modal, Upload, message, Tag } from 'antd'
import { UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useRecycleBin } from '../contexts/RecycleBinContext.jsx'
import { useOrchard } from '../contexts/OrchardContext.jsx'

const { Option } = Select
const { TabPane } = Tabs

// 模拟数据
const mockTreeRecords = [
  {
    id: 1,
    编号: 'A001',
    品种: '红富士苹果',
    树龄: 5,
    定植日期: '2021-03-15',
    地块: 'A区',
    土壤类型: '壤土',
    pH值: 6.5,
    肥力等级: '中等',
    产量: '15kg/株',
    健康状况: '良好'
  },
  {
    id: 2,
    编号: 'A002',
    品种: '红富士苹果',
    树龄: 5,
    定植日期: '2021-03-15',
    地块: 'A区',
    土壤类型: '壤土',
    pH值: 6.3,
    肥力等级: '中等',
    产量: '12kg/株',
    健康状况: '良好'
  },
  {
    id: 3,
    编号: 'B001',
    品种: '鸭梨',
    树龄: 4,
    定植日期: '2022-02-10',
    地块: 'B区',
    土壤类型: '沙壤土',
    pH值: 6.8,
    肥力等级: '高',
    产量: '20kg/株',
    健康状况: '良好'
  }
]

const mockGrowthRecords = [
  {
    id: 1,
    treeId: 'A001',
    物候期: '萌芽',
    日期: '2026-02-10',
    描述: '开始萌芽，芽体饱满'
  },
  {
    id: 2,
    treeId: 'A001',
    物候期: '开花',
    日期: '2026-03-15',
    描述: '花期正常，花量充足'
  }
]

const mockHealthRecords = [
  {
    id: 1,
    treeId: 'A001',
    病虫害: '蚜虫',
    发生日期: '2025-05-20',
    防治措施: '喷洒吡虫啉',
    效果: '良好'
  }
]

const TreeRecords = () => {
  const [activeTab, setActiveTab] = useState('basic')
  const [treeRecords, setTreeRecords] = useState(mockTreeRecords)
  const [growthRecords, setGrowthRecords] = useState(mockGrowthRecords)
  const [healthRecords, setHealthRecords] = useState(mockHealthRecords)
  const [modalVisible, setModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingTree, setEditingTree] = useState(null)
  const [form] = Form.useForm()
  const { moveToRecycleBin } = useRecycleBin()
  const { currentUser, currentOrchard } = useOrchard()

  // 上传图片
  const uploadProps = {
    name: 'file',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`)
      }
    },
  }

  // 提交表单
  const onFinish = (values) => {
    console.log('Received values of form:', values)
    if (editingTree) {
      // 编辑果树档案
      setTreeRecords(treeRecords.map(tree => {
        if (tree.id === editingTree.id) {
          return {
            ...tree,
            编号: values.编号,
            品种: values.品种,
            树龄: values.树龄,
            定植日期: values.定植日期 ? values.定植日期.format('YYYY-MM-DD') : null,
            地块: values.地块,
            土壤类型: values.土壤类型,
            pH值: values.pH值,
            肥力等级: values.肥力等级,
            产量: values.产量,
            健康状况: values.健康状况
          }
        }
        return tree
      }))
      setEditingTree(null)
      form.resetFields()
      setEditModalVisible(false)
      message.success('果树档案编辑成功！')
    } else {
      // 添加果树档案
      const newTree = {
        id: treeRecords.length + 1,
        编号: values.编号,
        品种: values.品种,
        树龄: values.树龄,
        定植日期: values.定植日期 ? values.定植日期.format('YYYY-MM-DD') : null,
        地块: values.地块,
        土壤类型: values.土壤类型,
        pH值: values.pH值,
        肥力等级: values.肥力等级,
        产量: values.产量,
        健康状况: values.健康状况
      }
      setTreeRecords([...treeRecords, newTree])
      form.resetFields()
      setModalVisible(false)
      message.success('果树档案添加成功！')
    }
  }
  
  // 编辑果树档案
  const handleEditTree = (tree) => {
    setEditingTree(tree)
    form.setFieldsValue({
      ...tree,
      定植日期: tree.定植日期 ? dayjs(tree.定植日期) : null
    })
    setEditModalVisible(true)
  }
  
  // 删除果树档案
  const handleDeleteTree = (id) => {
    const treeToDelete = treeRecords.find(tree => tree.id === id)
    if (treeToDelete) {
      moveToRecycleBin(treeToDelete, 'tree')
      setTreeRecords(treeRecords.filter(tree => tree.id !== id))
      message.success('果树档案已移至回收站！')
    }
  }
  
  // 编辑生长记录
  const handleEditGrowth = (record) => {
    // 这里可以添加编辑生长记录的逻辑
    message.success('生长记录编辑功能开发中！')
  }
  
  // 删除生长记录
  const handleDeleteGrowth = (id) => {
    setGrowthRecords(growthRecords.filter(record => record.id !== id))
    message.success('生长记录删除成功！')
  }
  
  // 编辑健康记录
  const handleEditHealth = (record) => {
    // 这里可以添加编辑健康记录的逻辑
    message.success('健康记录编辑功能开发中！')
  }
  
  // 删除健康记录
  const handleDeleteHealth = (id) => {
    setHealthRecords(healthRecords.filter(record => record.id !== id))
    message.success('健康记录删除成功！')
  }

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="基础信息" key="basic">
          <Card title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {currentOrchard?.name} - 果树档案管理
              {currentUser?.role === 'operator' && (
                <Tag color="blue" style={{ marginLeft: 8 }}>仅查看权限</Tag>
              )}
            </div>
          } extra={<Button type="primary" onClick={() => setModalVisible(true)}>添加果树档案</Button>}>
            <Table
              dataSource={treeRecords}
              rowKey="id"
              columns={[
                {
                  title: '编号',
                  dataIndex: '编号',
                  key: '编号'
                },
                {
                  title: '品种',
                  dataIndex: '品种',
                  key: '品种'
                },
                {
                  title: '树龄',
                  dataIndex: '树龄',
                  key: '树龄'
                },
                {
                  title: '定植日期',
                  dataIndex: '定植日期',
                  key: '定植日期'
                },
                {
                  title: '地块',
                  dataIndex: '地块',
                  key: '地块'
                },
                {
                  title: '土壤类型',
                  dataIndex: '土壤类型',
                  key: '土壤类型'
                },
                {
                  title: 'pH值',
                  dataIndex: 'pH值',
                  key: 'pH值'
                },
                {
                  title: '肥力等级',
                  dataIndex: '肥力等级',
                  key: '肥力等级'
                },
                {
                  title: '产量',
                  dataIndex: '产量',
                  key: '产量'
                },
                {
                  title: '健康状况',
                  dataIndex: '健康状况',
                  key: '健康状况'
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => (
                    <div>
                      <Button 
                        icon={<EditOutlined />} 
                        size="small" 
                        style={{ marginRight: 8 }}
                        onClick={() => handleEditTree(record)}
                      >
                        编辑
                      </Button>
                      <Button 
                        icon={<DeleteOutlined />} 
                        size="small" 
                        danger
                        onClick={() => handleDeleteTree(record.id)}
                      >
                        删除
                      </Button>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </TabPane>

        <TabPane tab="生长记录" key="growth">
          <Card title="生长记录管理">
            <Table
              dataSource={growthRecords}
              rowKey="id"
              columns={[
                {
                  title: '果树编号',
                  dataIndex: 'treeId',
                  key: 'treeId'
                },
                {
                  title: '物候期',
                  dataIndex: '物候期',
                  key: '物候期'
                },
                {
                  title: '日期',
                  dataIndex: '日期',
                  key: '日期'
                },
                {
                  title: '描述',
                  dataIndex: '描述',
                  key: '描述'
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => (
                    <div>
                      <Button 
                        icon={<EditOutlined />} 
                        size="small" 
                        style={{ marginRight: 8 }}
                        onClick={() => handleEditGrowth(record)}
                      >
                        编辑
                      </Button>
                      <Button 
                        icon={<DeleteOutlined />} 
                        size="small" 
                        danger
                        onClick={() => handleDeleteGrowth(record.id)}
                      >
                        删除
                      </Button>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </TabPane>

        <TabPane tab="健康档案" key="health">
          <Card title="健康档案管理">
            <Table
              dataSource={healthRecords}
              rowKey="id"
              columns={[
                {
                  title: '果树编号',
                  dataIndex: 'treeId',
                  key: 'treeId'
                },
                {
                  title: '病虫害',
                  dataIndex: '病虫害',
                  key: '病虫害'
                },
                {
                  title: '发生日期',
                  dataIndex: '发生日期',
                  key: '发生日期'
                },
                {
                  title: '防治措施',
                  dataIndex: '防治措施',
                  key: '防治措施'
                },
                {
                  title: '效果',
                  dataIndex: '效果',
                  key: '效果'
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => (
                    <div>
                      <Button 
                        icon={<EditOutlined />} 
                        size="small" 
                        style={{ marginRight: 8 }}
                        onClick={() => handleEditHealth(record)}
                      >
                        编辑
                      </Button>
                      <Button 
                        icon={<DeleteOutlined />} 
                        size="small" 
                        danger
                        onClick={() => handleDeleteHealth(record.id)}
                      >
                        删除
                      </Button>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </TabPane>

        <TabPane tab="果园地图" key="map">
          <Card title="果园地图">
            <div style={{ height: 500, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>果园地图功能开发中...</p>
            </div>
          </Card>
        </TabPane>
      </Tabs>

      {/* 添加果树档案模态框 */}
      <Modal
        title="添加果树档案"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="编号"
            label="果树编号"
            rules={[{ required: true, message: '请输入果树编号' }]}
          >
            <Input placeholder="例如：A001" />
          </Form.Item>

          <Form.Item
            name="品种"
            label="品种"
            rules={[{ required: true, message: '请选择品种' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="红富士苹果">红富士苹果</Option>
              <Option value="鸭梨">鸭梨</Option>
              <Option value="水蜜桃">水蜜桃</Option>
              <Option value="葡萄">葡萄</Option>
              <Option value="樱桃">樱桃</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="树龄"
            label="树龄"
            rules={[{ required: true, message: '请输入树龄' }]}
          >
            <Input type="number" placeholder="单位：年" />
          </Form.Item>

          <Form.Item
            name="定植日期"
            label="定植日期"
            rules={[{ required: true, message: '请选择定植日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="地块"
            label="地块"
            rules={[{ required: true, message: '请选择地块' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="A区">A区</Option>
              <Option value="B区">B区</Option>
              <Option value="C区">C区</Option>
              <Option value="D区">D区</Option>
              <Option value="E区">E区</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="土壤类型"
            label="土壤类型"
            rules={[{ required: true, message: '请选择土壤类型' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="壤土">壤土</Option>
              <Option value="沙壤土">沙壤土</Option>
              <Option value="粘土">粘土</Option>
              <Option value="砂土">砂土</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="pH值"
            label="pH值"
            rules={[{ required: true, message: '请输入pH值' }]}
          >
            <Input type="number" step="0.1" placeholder="例如：6.5" />
          </Form.Item>

          <Form.Item
            name="肥力等级"
            label="肥力等级"
            rules={[{ required: true, message: '请选择肥力等级' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="低">低</Option>
              <Option value="中等">中等</Option>
              <Option value="高">高</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="产量"
            label="产量"
            rules={[{ required: true, message: '请输入产量' }]}
          >
            <Input placeholder="例如：15kg/株" />
          </Form.Item>

          <Form.Item
            name="健康状况"
            label="健康状况"
            rules={[{ required: true, message: '请选择健康状况' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="良好">良好</Option>
              <Option value="一般">一般</Option>
              <Option value="较差">较差</Option>
            </Select>
          </Form.Item>

          <Form.Item label="照片上传">
            <Upload {...uploadProps} listType="picture-card">
              <Button icon={<UploadOutlined />}>上传果树照片</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 编辑果树档案模态框 */}
      <Modal
        title="编辑果树档案"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="编号"
            label="果树编号"
            rules={[{ required: true, message: '请输入果树编号' }]}
          >
            <Input placeholder="例如：A001" />
          </Form.Item>

          <Form.Item
            name="品种"
            label="品种"
            rules={[{ required: true, message: '请选择品种' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="红富士苹果">红富士苹果</Option>
              <Option value="鸭梨">鸭梨</Option>
              <Option value="水蜜桃">水蜜桃</Option>
              <Option value="葡萄">葡萄</Option>
              <Option value="樱桃">樱桃</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="树龄"
            label="树龄"
            rules={[{ required: true, message: '请输入树龄' }]}
          >
            <Input type="number" placeholder="单位：年" />
          </Form.Item>

          <Form.Item
            name="定植日期"
            label="定植日期"
            rules={[{ required: true, message: '请选择定植日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="地块"
            label="地块"
            rules={[{ required: true, message: '请选择地块' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="A区">A区</Option>
              <Option value="B区">B区</Option>
              <Option value="C区">C区</Option>
              <Option value="D区">D区</Option>
              <Option value="E区">E区</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="土壤类型"
            label="土壤类型"
            rules={[{ required: true, message: '请选择土壤类型' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="壤土">壤土</Option>
              <Option value="沙壤土">沙壤土</Option>
              <Option value="粘土">粘土</Option>
              <Option value="砂土">砂土</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="pH值"
            label="pH值"
            rules={[{ required: true, message: '请输入pH值' }]}
          >
            <Input type="number" step="0.1" placeholder="例如：6.5" />
          </Form.Item>

          <Form.Item
            name="肥力等级"
            label="肥力等级"
            rules={[{ required: true, message: '请选择肥力等级' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="低">低</Option>
              <Option value="中等">中等</Option>
              <Option value="高">高</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="产量"
            label="产量"
            rules={[{ required: true, message: '请输入产量' }]}
          >
            <Input placeholder="例如：15kg/株" />
          </Form.Item>

          <Form.Item
            name="健康状况"
            label="健康状况"
            rules={[{ required: true, message: '请选择健康状况' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="良好">良好</Option>
              <Option value="一般">一般</Option>
              <Option value="较差">较差</Option>
            </Select>
          </Form.Item>

          <Form.Item label="照片上传">
            <Upload {...uploadProps} listType="picture-card">
              <Button icon={<UploadOutlined />}>上传果树照片</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TreeRecords