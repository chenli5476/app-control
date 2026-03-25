import React, { useState, useEffect } from 'react'
import { Card, Tabs, Form, Input, Select, DatePicker, Table, Button, Modal, message, Badge } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useRecycleBin } from '../contexts/RecycleBinContext.jsx'
import { useOrchard } from '../contexts/OrchardContext.jsx'
import { authApi } from '../services/api.js'

const { Option } = Select

// 模拟数据
const mockInventory = [
  {
    id: 1,
    name: '复合肥',
    spec: '50kg/袋',
    supplier: '绿色农资有限公司',
    currentStock: 50,
    safeStock: 20,
    unitPrice: 100,
    totalValue: 5000,
    expiryDate: '2027-02-27',
    status: '正常',
    orchardId: 'xingfu'
  },
  {
    id: 2,
    name: '杀虫剂',
    spec: '100ml/瓶',
    supplier: '绿色农资有限公司',
    currentStock: 15,
    safeStock: 10,
    unitPrice: 50,
    totalValue: 750,
    expiryDate: '2027-05-15',
    status: '正常',
    orchardId: 'lvse'
  },
  {
    id: 3,
    name: '杀菌剂',
    spec: '200ml/瓶',
    supplier: '绿色农资有限公司',
    currentStock: 8,
    safeStock: 10,
    unitPrice: 80,
    totalValue: 640,
    expiryDate: '2027-03-10',
    status: '低于安全库存',
    orchardId: 'xingfu'
  },
  {
    id: 4,
    name: '修剪工具',
    spec: '套',
    supplier: '农业工具供应商',
    currentStock: 5,
    safeStock: 3,
    unitPrice: 200,
    totalValue: 1000,
    expiryDate: '无',
    status: '正常',
    orchardId: 'fengshou'
  }
]

const mockInventoryRecords = [
  {
    id: 1,
    itemName: '复合肥',
    type: '入库',
    quantity: 50,
    date: '2026-02-01',
    purpose: '采购',
    operator: '张三'
  },
  {
    id: 2,
    itemName: '杀虫剂',
    type: '入库',
    quantity: 20,
    date: '2026-02-05',
    purpose: '采购',
    operator: '张三'
  },
  {
    id: 3,
    itemName: '复合肥',
    type: '出库',
    quantity: 10,
    date: '2026-02-10',
    purpose: '苹果树施肥',
    operator: '李四'
  },
  {
    id: 4,
    itemName: '杀虫剂',
    type: '出库',
    quantity: 5,
    date: '2026-02-15',
    purpose: '梨树病虫害防治',
    operator: '李四'
  }
]

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('stock')
  const [allInventory, setAllInventory] = useState(mockInventory)
  const [inventoryRecords, setInventoryRecords] = useState(mockInventoryRecords)
  const [modalVisible, setModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [inStockModalVisible, setInStockModalVisible] = useState(false)
  const [outStockModalVisible, setOutStockModalVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // 从API获取当前用户信息
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authApi.getCurrentUser()
        if (response.data) {
          setCurrentUser(response.data)
        }
      } catch (error) {
        console.error('获取当前用户失败:', error)
        // 如果API失败，回退到localStorage
        const savedUser = localStorage.getItem('currentUser')
        if (savedUser) {
          try {
            setCurrentUser(JSON.parse(savedUser))
          } catch (e) {
            console.error('解析用户数据失败:', e)
          }
        }
      }
    }
    
    fetchCurrentUser()
  }, [])
  const [editingItem, setEditingItem] = useState(null)
  const [currentItem, setCurrentItem] = useState(null)
  const [inStockQuantity, setInStockQuantity] = useState(10)
  const [outStockQuantity, setOutStockQuantity] = useState(5)
  const [form] = Form.useForm()
  const { moveToRecycleBin } = useRecycleBin()
  const { currentOrchard, filterByOrchard } = useOrchard()
  
  const inventory = filterByOrchard(allInventory)

  // 提交表单
  const onFinish = (values) => {
    if (editingItem) {
      // 编辑农资
      setAllInventory(allInventory.map(item => {
        if (item.id === editingItem.id) {
          const currentStock = item.currentStock
          return {
            ...item,
            name: values.name,
            spec: values.spec,
            supplier: values.supplier,
            safeStock: values.safeStock,
            unitPrice: values.unitPrice,
            totalValue: currentStock * values.unitPrice,
            expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : '无',
            status: currentStock >= values.safeStock ? '正常' : '低于安全库存'
          }
        }
        return item
      }))
      setEditingItem(null)
      form.resetFields()
      setEditModalVisible(false)
      message.success('编辑成功！')
    } else {
      // 添加农资
      const newItem = {
        id: allInventory.length + 1,
        name: values.name,
        spec: values.spec,
        supplier: values.supplier,
        currentStock: values.initialStock,
        safeStock: values.safeStock,
        unitPrice: values.unitPrice,
        totalValue: values.initialStock * values.unitPrice,
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : '无',
        status: values.initialStock >= values.safeStock ? '正常' : '低于安全库存',
        orchardId: currentOrchard.id
      }
      setAllInventory([...allInventory, newItem])
      form.resetFields()
      setModalVisible(false)
      message.success('农资添加成功！')
    }
  }

  // 编辑农资
  const handleEdit = (item) => {
    setEditingItem(item)
    form.setFieldsValue({
      ...item,
      expiryDate: item.expiryDate === '无' ? null : dayjs(item.expiryDate)
    })
    setEditModalVisible(true)
  }

  // 删除农资
  const handleDelete = (id) => {
    const itemToDelete = allInventory.find(item => item.id === id)
    if (itemToDelete) {
      moveToRecycleBin(itemToDelete, 'inventory')
      setAllInventory(allInventory.filter(item => item.id !== id))
      message.success('农资已移至回收站！')
    }
  }

  // 打开入库模态框
  const openInStockModal = (item) => {
    setCurrentItem(item)
    setInStockQuantity(10)
    setInStockModalVisible(true)
  }

  // 打开出库模态框
  const openOutStockModal = (item) => {
    setCurrentItem(item)
    setOutStockQuantity(5)
    setOutStockModalVisible(true)
  }

  // 执行入库操作
  const confirmInStock = () => {
    if (!currentItem) return
    
    // 使用state中的currentUser
    const operatorName = currentUser?.name || '当前用户'
    
    setAllInventory(allInventory.map(item => {
      if (item.id === currentItem.id) {
        const newStock = item.currentStock + inStockQuantity
        return {
          ...item,
          currentStock: newStock,
          totalValue: newStock * item.unitPrice,
          status: newStock >= item.safeStock ? '正常' : '低于安全库存'
        }
      }
      return item
    }))
    
    // 添加入库记录
    const newRecord = {
      id: inventoryRecords.length + 1,
      itemName: currentItem.name,
      type: '入库',
      quantity: inStockQuantity,
      date: new Date().toISOString().split('T')[0],
      purpose: '采购',
      operator: operatorName
    }
    setInventoryRecords([newRecord, ...inventoryRecords])
    
    setInStockModalVisible(false)
    message.success('入库成功！')
  }

  // 执行出库操作
  const confirmOutStock = () => {
    if (!currentItem) return
    
    if (currentItem.currentStock < outStockQuantity) {
      message.error('库存不足！')
      return
    }
    
    // 使用state中的currentUser
    const operatorName = currentUser?.name || '当前用户'
    
    setAllInventory(allInventory.map(item => {
      if (item.id === currentItem.id) {
        const newStock = item.currentStock - outStockQuantity
        return {
          ...item,
          currentStock: newStock,
          totalValue: newStock * item.unitPrice,
          status: newStock >= item.safeStock ? '正常' : '低于安全库存'
        }
      }
      return item
    }))
    
    // 添加出库记录
    const newRecord = {
      id: inventoryRecords.length + 1,
      itemName: currentItem.name,
      type: '出库',
      quantity: outStockQuantity,
      date: new Date().toISOString().split('T')[0],
      purpose: '使用',
      operator: operatorName
    }
    setInventoryRecords([newRecord, ...inventoryRecords])
    
    setOutStockModalVisible(false)
    message.success('出库成功！')
  }

  return (
    <div>
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'stock',
            label: '库存管理',
            children: (
              <Card title={`${currentOrchard?.name || '默认果园'} - 农资库存管理`} extra={<Button type="primary" onClick={() => setModalVisible(true)}>添加农资</Button>}>
                <Table
                  dataSource={inventory}
                  rowKey="id"
                  columns={[
                    {
                      title: '农资名称',
                      dataIndex: 'name',
                      key: 'name'
                    },
                    {
                      title: '规格',
                      dataIndex: 'spec',
                      key: 'spec'
                    },
                    {
                      title: '供应商',
                      dataIndex: 'supplier',
                      key: 'supplier'
                    },
                    {
                      title: '当前库存',
                      dataIndex: 'currentStock',
                      key: 'currentStock'
                    },
                    {
                      title: '安全库存',
                      dataIndex: 'safeStock',
                      key: 'safeStock'
                    },
                    {
                      title: '单价',
                      dataIndex: 'unitPrice',
                      key: 'unitPrice',
                      render: (price) => `¥${price}`
                    },
                    {
                      title: '总价值',
                      dataIndex: 'totalValue',
                      key: 'totalValue',
                      render: (value) => `¥${value}`
                    },
                    {
                      title: '保质期',
                      dataIndex: 'expiryDate',
                      key: 'expiryDate'
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => {
                        let color = ''
                        switch (status) {
                          case '正常':
                            color = 'green'
                            break
                          case '低于安全库存':
                            color = 'orange'
                            break
                          case '临期':
                            color = 'red'
                            break
                          default:
                            color = 'black'
                        }
                        return <Badge color={color} text={status} />
                      }
                    },
                    {
                      title: '操作',
                      key: 'action',
                      render: (_, record) => (
                        <div>
                          <Button 
                            icon={<PlusOutlined />} 
                            size="small" 
                            style={{ marginRight: 8 }}
                            onClick={() => openInStockModal(record)}
                          >
                            入库
                          </Button>
                          <Button 
                            icon={<MinusOutlined />} 
                            size="small" 
                            style={{ marginRight: 8 }}
                            onClick={() => openOutStockModal(record)}
                          >
                            出库
                          </Button>
                          <Button 
                            icon={<EditOutlined />} 
                            size="small" 
                            style={{ marginRight: 8 }}
                            onClick={() => handleEdit(record)}
                          >
                            编辑
                          </Button>
                          <Button 
                            icon={<DeleteOutlined />} 
                            size="small" 
                            danger
                            onClick={() => handleDelete(record.id)}
                          >
                            删除
                          </Button>
                        </div>
                      )
                    }
                  ]}
                />
              </Card>
            )
          },
          {
            key: 'records',
            label: '出入库记录',
            children: (
              <Card title="出入库记录">
                <Table
                  dataSource={inventoryRecords}
                  rowKey="id"
                  columns={[
                    {
                      title: '农资名称',
                      dataIndex: 'itemName',
                      key: 'itemName'
                    },
                    {
                      title: '类型',
                      dataIndex: 'type',
                      key: 'type',
                      render: (type) => (
                        <Badge color={type === '入库' ? 'green' : 'red'} text={type} />
                      )
                    },
                    {
                      title: '数量',
                      dataIndex: 'quantity',
                      key: 'quantity'
                    },
                    {
                      title: '日期',
                      dataIndex: 'date',
                      key: 'date'
                    },
                    {
                      title: '用途',
                      dataIndex: 'purpose',
                      key: 'purpose'
                    },
                    {
                      title: '操作人',
                      dataIndex: 'operator',
                      key: 'operator'
                    }
                  ]}
                />
              </Card>
            )
          },
          {
            key: 'cost',
            label: '成本分析',
            children: (
              <Card title="农资成本分析">
                <div style={{ height: 400, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p>成本分析图表开发中...</p>
                </div>
              </Card>
            )
          }
        ]}
      />

      {/* 添加农资模态框 */}
      <Modal
        title="添加农资"
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
            name="name"
            label="农资名称"
            rules={[{ required: true, message: '请输入农资名称' }]}
          >
            <Input placeholder="例如：复合肥" />
          </Form.Item>

          <Form.Item
            name="spec"
            label="规格"
            rules={[{ required: true, message: '请输入规格' }]}
          >
            <Input placeholder="例如：50kg/袋" />
          </Form.Item>

          <Form.Item
            name="supplier"
            label="供应商"
            rules={[{ required: true, message: '请输入供应商' }]}
          >
            <Input placeholder="例如：绿色农资有限公司" />
          </Form.Item>

          <Form.Item
            name="initialStock"
            label="初始库存"
            rules={[{ required: true, message: '请输入初始库存' }]}
          >
            <Input type="number" placeholder="例如：50" />
          </Form.Item>

          <Form.Item
            name="safeStock"
            label="安全库存"
            rules={[{ required: true, message: '请输入安全库存' }]}
          >
            <Input type="number" placeholder="例如：20" />
          </Form.Item>

          <Form.Item
            name="unitPrice"
            label="单价"
            rules={[{ required: true, message: '请输入单价' }]}
          >
            <Input type="number" placeholder="例如：100" />
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label="保质期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 编辑农资模态框 */}
      <Modal
        title="编辑农资"
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
            name="name"
            label="农资名称"
            rules={[{ required: true, message: '请输入农资名称' }]}
          >
            <Input placeholder="例如：复合肥" />
          </Form.Item>

          <Form.Item
            name="spec"
            label="规格"
            rules={[{ required: true, message: '请输入规格' }]}
          >
            <Input placeholder="例如：50kg/袋" />
          </Form.Item>

          <Form.Item
            name="supplier"
            label="供应商"
            rules={[{ required: true, message: '请输入供应商' }]}
          >
            <Input placeholder="例如：绿色农资有限公司" />
          </Form.Item>

          <Form.Item
            name="safeStock"
            label="安全库存"
            rules={[{ required: true, message: '请输入安全库存' }]}
          >
            <Input type="number" placeholder="例如：20" />
          </Form.Item>

          <Form.Item
            name="unitPrice"
            label="单价"
            rules={[{ required: true, message: '请输入单价' }]}
          >
            <Input type="number" placeholder="例如：100" />
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label="保质期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 入库模态框 */}
      <Modal
        title="入库操作"
        open={inStockModalVisible}
        onCancel={() => setInStockModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setInStockModalVisible(false)}>
            取消
          </Button>,
          <Button key="confirm" type="primary" onClick={confirmInStock}>
            确认入库
          </Button>
        ]}
      >
        <div style={{ padding: 24 }}>
          <p>农资名称：{currentItem?.name}</p>
          <p>当前库存：{currentItem?.currentStock}</p>
          <div style={{ marginTop: 16 }}>
            <Input
              type="number"
              placeholder="请输入入库数量"
              value={inStockQuantity}
              onChange={(e) => setInStockQuantity(Number(e.target.value) || 0)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Modal>
      
      {/* 出库模态框 */}
      <Modal
        title="出库操作"
        open={outStockModalVisible}
        onCancel={() => setOutStockModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setOutStockModalVisible(false)}>
            取消
          </Button>,
          <Button key="confirm" type="primary" onClick={confirmOutStock}>
            确认出库
          </Button>
        ]}
      >
        <div style={{ padding: 24 }}>
          <p>农资名称：{currentItem?.name}</p>
          <p>当前库存：{currentItem?.currentStock}</p>
          <div style={{ marginTop: 16 }}>
            <Input
              type="number"
              placeholder="请输入出库数量"
              value={outStockQuantity}
              onChange={(e) => setOutStockQuantity(Number(e.target.value) || 0)}
              style={{ width: '100%' }}
            />
          </div>
          {currentItem && currentItem.currentStock < outStockQuantity && (
            <p style={{ color: 'red', marginTop: 8 }}>库存不足！</p>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Inventory