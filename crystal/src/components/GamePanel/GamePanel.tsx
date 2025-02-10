import './GamePanel.css'

// import {useState} from 'react'

import { Row, Col, Card } from 'antd';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// const { Title } = Typography;

// 示例数据
// const priceHistoryData = [
//   { 商店: 'Steam', 区域: '国区', 货币: '人民币', 价格: 100 },
//   { 商店: 'Epic Games', 区域: '国区', 货币: '人民币', 价格: 90 },
//   { 商店: 'GOG', 区域: '国区', 货币: '人民币', 价格: 110 },
//   // 更多数据...
// ];

// const chartData = [
//   { name: '1月', 价格: 100 },
//   { name: '2月', 价格: 90 },
//   { name: '3月', 价格: 110 },
//   { name: '4月', 价格: 80 },
//   { name: '5月', 价格: 120 },
//   { name: '6月', 价格: 100 },
//   { name: '7月', 价格: 90 },
//   { name: '8月', 价格: 110 },
//   { name: '9月', 价格: 80 },
//   { name: '10月', 价格: 120 },
//   { name: '11月', 价格: 100 },
//   { name: '12月', 价格: 90 },
// ];

// const columns = [
//   { title: '区域', dataIndex: '区域', key: '区域' },
//   { title: '商店', dataIndex: '商店', key: '商店' },
//   { title: '货币', dataIndex: '货币', key: '货币' },
//   { title: '价格', dataIndex: '价格', key: '价格' },
// ];

// 模仿 小黑盒的布局

// [史低价格：xxx] [在线人数：xxx] [支持语言：xxx] 
// -价格历史- -多方比价- -促销节点- 

// 价格历史：
// 区域 商店 货币（慢慢增加：仅国区、仅Steam、仅人民币）
// 阶梯线图
// 当前最低价格：区域 平台 货币 支付方式

// 多方比价：
// - 导航至 杉果
// - 导航至 Game2K等
// - 导航至 其他平台
// 自己发行

// 库中
// -攻略论坛- -学习研究- -游戏搭子- -其他资源- -我的笔记- -分享笔记-
// -发布游戏进度到我的描述/心情/状态
// 私服列表，发布我的私服
// 硬件推荐
// 伴侣维护的QQ交流群


// 攻略论坛：维护者
// - xxxx
// - xxxx
// + 我有推荐

// 私服列表：维护者
function App() {
    // const [count, setCount] = useState(0)

    // return (
    //     <div className="fixedPanel">
    //         <div className="card">
    //             <button onClick={() => setCount((count) => count + 1)}>
    //                 count is {count}
    //             </button>
    //         </div>
    //     </div>
    // )

    return (
        <div style={{ padding: 24 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card title="史低价格" bordered={false}>xxx</Card>
            </Col>
            <Col span={6}>
              <Card title="在线人数" bordered={false}>xxx</Card>
            </Col>
            <Col span={6}>
              <Card title="支持语言" bordered={false}>xxx</Card>
            </Col>
          </Row>
    
          {/* <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={12}>
              <Card title="价格历史" bordered={false}>
                <Table
                  dataSource={priceHistoryData}
                  columns={columns}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row> */}
    
          {/* <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card title="促销节点" bordered={false}>
                <Title level={4}>这里可以添加促销节点的信息</Title>
              </Card>
            </Col>
          </Row> */}
        </div>
      );
}

export default App
