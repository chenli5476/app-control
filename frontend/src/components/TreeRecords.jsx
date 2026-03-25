import React, { useState } from 'react'
import { Card, Form, Input, Select, DatePicker, Table, Button, Modal, Upload, message, Tag } from 'antd'
import { UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useRecycleBin } from '../contexts/RecycleBinContext.jsx'
import { useOrchard } from '../contexts/OrchardContext.jsx'

const { Option } = Select

// 模拟数据
const mockTreeRecords = [
  {
    id: 1,
    编号: 'A001',
    品种: '红富士苹果',
    树龄: 5,
    定植日期: '2021-03-15',
    地块: 'A区'
  },
  {
    id: 2,
    编号: 'A002',
    品种: '红富士苹果',
    树龄: 5,
    定植日期: '2021-03-15',
    地块: 'A区'
  },
  {
    id: 3,
    编号: 'B001',
    品种: '鸭梨',
    树龄: 4,
    定植日期: '2022-02-10',
    地块: 'B区'
  }
]

// 表单字段配置
const formFields = [
  { name: '编号', label: '果树编号', placeholder: '例如：A001', required: true },
  {
    name: '品种',
    label: '品种',
    type: 'select',
    options: ['红富士苹果', '鸭梨', '水蜜桃', '葡萄', '樱桃'],
    required: true
  },
  { name: '树龄', label: '树龄', type: 'number', placeholder: '单位：年', required: true },
  { name: '定植日期', label: '定植日期', type: 'date', required: true },
  {
    name: '地块',
    label: '地块',
    type: 'select',
    options: ['A区', 'B区', 'C区', 'D区', 'E区'],
    required: true
  }
]

// 可复用的果树表单组件
const TreeForm = ({ form, onFinish, uploadProps, submitText = '保存' }) => {
  const renderFormItem = (field) => {
    const rules = field.required ? [{ required: true, message: field.placeholder || `请输入${field.label}` }] : []

    let inputElement
    switch (field.type) {
      case 'select':
        inputElement = (
          <Select style={{ width: '100%' }}>
            {field.options.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
          </Select>
        )
        break
      case 'number':
        inputElement = <Input type="number" placeholder={field.placeholder} />
        break
      case 'date':
        inputElement = <DatePicker style={{ width: '100%' }} />
        break
      default:
        inputElement = <Input placeholder={field.placeholder} />
    }

    return (
      <Form.Item key={field.name} name={field.name} label={field.label} rules={rules}>
        {inputElement}
      </Form.Item>
    )
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      {formFields.map(renderFormItem)}
      <Form.Item label="照片上传">
        <Upload {...uploadProps} listType="picture-card">
          <Button icon={<UploadOutlined />}>上传果树照片</Button>
        </Upload>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
          {submitText}
        </Button>
      </Form.Item>
    </Form>
  )
}

const TreeRecords = () => {
  const [treeRecords, setTreeRecords] = useState(mockTreeRecords)
  const [modalVisible, setModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingTree, setEditingTree] = useState(null)
  const [form] = Form.useForm()
  const { moveToRecycleBin } = useRecycleBin()
  const { currentUser, currentOrchard } = useOrchard()

  // 上传图片配置
  const uploadProps = {
    name: 'file',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    headers: { authorization: 'authorization-text' },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`)
      }
    }
  }

  // 处理表单提交
  const handleSubmit = (values, isEdit = false) => {
    const formattedValues = {
      ...values,
      定植日期: values.定植日期 ? values.定植日期.format('YYYY-MM-DD') : null
    }

    if (isEdit && editingTree) {
      setTreeRecords(treeRecords.map(tree =>
        tree.id === editingTree.id ? { ...tree, ...formattedValues } : tree
      ))
      setEditingTree(null)
      message.success('果树档案编辑成功！')
    } else {
      const newTree = { id: treeRecords.length + 1, ...formattedValues }
      setTreeRecords([...treeRecords, newTree])
      message.success('果树档案添加成功！')
    }

    form.resetFields()
    isEdit ? setEditModalVisible(false) : setModalVisible(false)
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

  // 表格列定义
  const columns = [
    { title: '编号', dataIndex: '编号', key: '编号' },
    { title: '品种', dataIndex: '品种', key: '品种' },
    { title: '树龄', dataIndex: '树龄', key: '树龄' },
    { title: '定植日期', dataIndex: '定植日期', key: '定植日期' },
    { title: '地块', dataIndex: '地块', key: '地块' },
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
  ]

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {currentOrchard?.name} - 果树档案管理
            {currentUser?.role === 'operator' && (
              <Tag color="blue" style={{ marginLeft: 8 }}>仅查看权限</Tag>
            )}
          </div>
        }
        extra={<Button type="primary" onClick={() => setModalVisible(true)}>添加果树档案</Button>}
      >
        <Table dataSource={treeRecords} rowKey="id" columns={columns} />
      </Card>

      {/* 添加果树档案模态框 */}
      <Modal
        title="添加果树档案"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <TreeForm
          form={form}
          onFinish={(values) => handleSubmit(values, false)}
          uploadProps={uploadProps}
          submitText="保存"
        />
      </Modal>

      {/* 编辑果树档案模态框 */}
      <Modal
        title="编辑果树档案"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <TreeForm
          form={form}
          onFinish={(values) => handleSubmit(values, true)}
          uploadProps={uploadProps}
          submitText="保存修改"
        />
      </Modal>
    </div>
  )
}

export default TreeRecords
