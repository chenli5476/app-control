import React from 'react'
import { Select } from 'antd'
import { useOrchard } from '../../contexts/OrchardContext'

const OrchardSelector = () => {
  const { orchards, currentOrchard, switchOrchard } = useOrchard()
  
  return (
    <Select
      value={currentOrchard?.id}
      onChange={switchOrchard}
      style={{ width: 140, marginRight: 16 }}
      dropdownStyle={{ minWidth: 140 }}
    >
      {orchards.map(orchard => (
        <Select.Option key={orchard.id} value={orchard.id}>
          {orchard.name}
        </Select.Option>
      ))}
    </Select>
  )
}

export default OrchardSelector
