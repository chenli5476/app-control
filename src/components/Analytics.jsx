import React, { useState, useEffect, useRef } from 'react'
import { Card, Tabs, Button, DatePicker, Select, Row, Col, Statistic, Input } from 'antd'
import * as echarts from 'echarts'

const { Option } = Select
const { TabPane } = Tabs
const { RangePicker } = DatePicker

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('production')
  const [laborCost, setLaborCost] = useState(40000)
  const [materialCost, setMaterialCost] = useState(30000)
  const [energyCost, setEnergyCost] = useState(15000)
  const [equipmentCost, setEquipmentCost] = useState(10000)
  const [otherCost, setOtherCost] = useState(5000)
  const yieldChartRef = useRef(null)
  const costChartRef = useRef(null)
  const qualityChartRef = useRef(null)
  const treeChartRef = useRef(null)
  
  // 计算总成本
  const totalCost = laborCost + materialCost + energyCost + equipmentCost + otherCost

  // 渲染统计图表
  useEffect(() => {
    if (yieldChartRef.current) {
      const chart = echarts.init(yieldChartRef.current)
      const option = {
        title: {
          text: '投入产出比分析',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['成本', '收益'],
          bottom: 0
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '成本',
            data: [10000, 12000, 9000, 11000, null, null],
            type: 'bar'
          },
          {
            name: '收益',
            data: [15000, 18000, 13000, 16000, null, null],
            type: 'bar'
          }
        ]
      }
      chart.setOption(option)
    }

    if (costChartRef.current) {
      const chart = echarts.init(costChartRef.current)
      const option = {
        title: {
          text: '成本构成分析',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '成本类型',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 40, name: '人工成本' },
              { value: 30, name: '农资成本' },
              { value: 15, name: '能耗成本' },
              { value: 10, name: '设备成本' },
              { value: 5, name: '其他成本' }
            ]
          }
        ]
      }
      chart.setOption(option)
    }

    if (qualityChartRef.current) {
      const chart = echarts.init(qualityChartRef.current)
      const option = {
        title: {
          text: '品质趋势分析',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['糖度', '果径'],
          bottom: 0
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '糖度',
            data: [12, 13, 14, 15, null, null],
            type: 'line'
          },
          {
            name: '果径',
            data: [70, 75, 80, 85, null, null],
            type: 'line'
          }
        ]
      }
      chart.setOption(option)
    }

    if (treeChartRef.current) {
      const chart = echarts.init(treeChartRef.current)
      const option = {
        title: {
          text: '单株产量分析',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['A001', 'A002', 'A003', 'A004', 'A005', 'A006', 'A007', 'A008', 'A009', 'A010']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '产量',
            data: [15, 12, 18, 14, 20, 16, 13, 17, 19, 14],
            type: 'bar'
          }
        ]
      }
      chart.setOption(option)
    }
  }, [])

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="生产分析" key="production">
          <Card title="生产分析">
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Statistic title="投入产出比" value={1.5} suffix=":1" />
              </Col>
              <Col span={8}>
                <Statistic title="平均单株产量" value={15} suffix="kg" />
              </Col>
              <Col span={8}>
                <Statistic title="优质果率" value={85} suffix="%" />
              </Col>
            </Row>
            
            <div style={{ height: 400, marginBottom: 24 }} ref={yieldChartRef} />
            <div style={{ height: 400 }} ref={treeChartRef} />
          </Card>
        </TabPane>

        <TabPane tab="成本核算" key="cost">
          <Card title="成本核算">
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Statistic title="人工成本" value={laborCost} prefix="¥" />
              </Col>
              <Col span={8}>
                <Statistic title="农资成本" value={materialCost} prefix="¥" />
              </Col>
              <Col span={8}>
                <Statistic title="能耗成本" value={energyCost} prefix="¥" />
              </Col>
            </Row>
            
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Statistic title="设备成本" value={equipmentCost} prefix="¥" />
              </Col>
              <Col span={8}>
                <Statistic title="其他成本" value={otherCost} prefix="¥" />
              </Col>
              <Col span={8}>
                <Statistic title="总成本" value={totalCost} prefix="¥" />
              </Col>
            </Row>
            
            <div style={{ marginBottom: 24, padding: 24, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
              <h3 style={{ marginBottom: 16 }}>成本输入</h3>
              <Row gutter={16}>
                <Col span={12}>
                  <Input
                    type="number"
                    placeholder="人工成本"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value) || 0)}
                    style={{ marginBottom: 16 }}
                  />
                  <Input
                    type="number"
                    placeholder="农资成本"
                    value={materialCost}
                    onChange={(e) => setMaterialCost(Number(e.target.value) || 0)}
                    style={{ marginBottom: 16 }}
                  />
                  <Input
                    type="number"
                    placeholder="能耗成本"
                    value={energyCost}
                    onChange={(e) => setEnergyCost(Number(e.target.value) || 0)}
                  />
                </Col>
                <Col span={12}>
                  <Input
                    type="number"
                    placeholder="设备成本"
                    value={equipmentCost}
                    onChange={(e) => setEquipmentCost(Number(e.target.value) || 0)}
                    style={{ marginBottom: 16 }}
                  />
                  <Input
                    type="number"
                    placeholder="其他成本"
                    value={otherCost}
                    onChange={(e) => setOtherCost(Number(e.target.value) || 0)}
                    style={{ marginBottom: 16 }}
                  />
                  <div style={{ padding: 16, backgroundColor: '#e6f7ff', borderRadius: 4, marginTop: 8 }}>
                    <p style={{ fontWeight: 'bold' }}>总成本: ¥{totalCost}</p>
                  </div>
                </Col>
              </Row>
            </div>
            
            <div style={{ height: 400 }} ref={costChartRef} />
          </Card>
        </TabPane>

        <TabPane tab="品质分析" key="quality">
          <Card title="品质分析">
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Statistic title="平均糖度" value={14.5} suffix="°Brix" />
              </Col>
              <Col span={8}>
                <Statistic title="平均果径" value={80} suffix="mm" />
              </Col>
              <Col span={8}>
                <Statistic title="外观评分" value={9.2} suffix="/10" />
              </Col>
            </Row>
            
            <div style={{ height: 400 }} ref={qualityChartRef} />
          </Card>
        </TabPane>

        <TabPane tab="报表导出" key="export">
          <Card title="报表导出">
            <div style={{ padding: 24 }}>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                  <RangePicker style={{ width: '100%' }} />
                </Col>
                <Col span={12}>
                  <Select style={{ width: '100%' }} placeholder="选择报表类型">
                    <Option value="annual">年度生产报告</Option>
                    <Option value="pesticide">农药使用报告</Option>
                    <Option value="cost">成本分析报告</Option>
                    <Option value="custom">自定义报表</Option>
                  </Select>
                </Col>
              </Row>
              
              <Button type="primary" size="large" style={{ width: '100%' }}>
                导出报表
              </Button>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default Analytics