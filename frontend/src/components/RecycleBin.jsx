import React, { useState } from 'react'
import { Card, Table, Button, Tabs, Tag, Modal, message, Tooltip } from 'antd'
import {
  UndoOutlined,
  DeleteOutlined,
  ClearOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useRecycleBin } from '../contexts/RecycleBinContext.jsx'
import dayjs from 'dayjs'



const RecycleBin = () => {
  const {
    deletedItems,
    restoreItem,
    permanentDelete,
    clearAll,
    getItemsByType
  } = useRecycleBin()
  const [activeTab, setActiveTab] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState('') // 'restore' 或 'delete'

  const currentItems = getItemsByType(activeTab)

  const getTypeTag = (type) => {
    const config = {
      tree: { color: 'green', text: '果树档案' },
      inventory: { color: 'blue', text: '农资库存' },
      task: { color: 'orange', text: '任务计划' }
    }
    return <Tag color={config[type]?.color}>{config[type]?.text}</Tag>
  }

  const handleRestore = (record) => {
    setSelectedItem(record)
    setModalType('restore')
    setModalVisible(true)
  }

  const handlePermanentDelete = (record) => {
    setSelectedItem(record)
    setModalType('delete')
    setModalVisible(true)
  }

  const confirmAction = () => {
    if (modalType === 'restore') {
      restoreItem(selectedItem.recycleId)
      message.success(`已恢复：${selectedItem.name || selectedItem.title}`)
      // TODO: 调用对应模块的恢复接口
    } else {
      permanentDelete(selectedItem.recycleId)
      message.success('已彻底删除')
    }
    setModalVisible(false)
  }

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => text || record.title || '未命名'
    },
    {
      title: '类型',
      dataIndex: 'originalType',
      key: 'type',
      render: (type) => getTypeTag(type)
    },
    {
      title: '删除时间',
      dataIndex: 'deletedAt',
      key: 'deletedAt',
      render: (date) => (
        <Tooltip title={`将于 ${dayjs(date).add(30, 'day').format('YYYY-MM-DD')} 自动清理`}>
          <span><ClockCircleOutlined /> {dayjs(date).format('YYYY-MM-DD HH:mm')}</span>
        </Tooltip>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button
            type="primary"
            size="small"
            icon={<UndoOutlined />}
            onClick={() => handleRestore(record)}
            style={{ marginRight: 8 }}
          >
            恢复
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handlePermanentDelete(record)}
          >
            彻底删除
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <h1 style={{ marginBottom: 24, textAlign: 'center' }}>回收站</h1>
      
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'all', label: `全部 (${deletedItems.length})` },
              { key: 'tree', label: '果树档案' },
              { key: 'inventory', label: '农资库存' },
              { key: 'task', label: '任务计划' }
            ]}
          />
          
          {deletedItems.length > 0 && (
            <Button
              danger
              icon={<ClearOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '确认清空回收站？',
                  content: '此操作不可恢复，所有项目将被彻底删除',
                  onOk: clearAll
                })
              }}
            >
              清空回收站
            </Button>
          )}
        </div>

        <Table
          dataSource={currentItems}
          columns={columns}
          rowKey="recycleId"
          locale={{ emptyText: '回收站为空' }}
        />
      </Card>

      <Modal
        title={modalType === 'restore' ? '确认恢复' : '确认彻底删除'}
        open={modalVisible}
        onOk={confirmAction}
        onCancel={() => setModalVisible(false)}
        okText={modalType === 'restore' ? '恢复' : '彻底删除'}
        cancelText="取消"
        okButtonProps={{ danger: modalType === 'delete' }}
      >
        <p>
          {modalType === 'restore'
            ? `确定要恢复"${selectedItem?.name || selectedItem?.title}"吗？恢复后将回到原列表。`
            : `确定要彻底删除"${selectedItem?.name || selectedItem?.title}"吗？此操作不可恢复！`
          }
        </p>
      </Modal>
    </div>
  )
}

export default RecycleBin