import {Line} from '@ant-design/plots';
import React from 'react';
import {AggGameInfo} from "../client/price";
import dayjs from "dayjs";
import {Tag, Typography} from "antd";

type PriceHistoryPanelProps = {
  gameInfo: AggGameInfo
}

function priceChartsData(gameInfo: AggGameInfo) {

  return gameInfo.historyLogs.reverse().map(stage => {
    return {
      time: dayjs(stage.timestamp).tz("Asia/Shanghai").format("YYYY-MM-DD"),
      value: stage.deal.price.amount
    };
  })
}

const PriceHistoryPanel: React.FC<PriceHistoryPanelProps> =
  (props) => {
    const data = priceChartsData(props.gameInfo);

    // 处理应用图标：https://www.zhihu.com/question/626108835，直接下载下来，截取一个位置（P0）
    // 选择一个好看的背景图（P1）
    // 正确处理主题色(P2)
    // 如何处理时间：https://ant-design-charts.antgroup.com/zh/examples/statistics/line#connect-nulls(P2)
    // 
    const config = {
      data: data,
      title: '价格趋势',
      xField: 'time',
      xAxis: {
        visible: false,
      },
      children: [
        {
          type: 'line',
          yField: 'value',
          shapeField: 'vh',
          style: {
            stroke: '#29cae4',
            lineWidth: 2,
          },
        },
      ],
    };
    return (
      <>
        <Typography.Text strong>
          当前商品的史低价格为：
          <Tag color="green">
            { props.gameInfo?.storeLow.price ? `${props.gameInfo.storeLow.price}` : '暂无数据'}
          </Tag>
        </Typography.Text>
        <Line {...config} />
      </>
    );
  };

export default PriceHistoryPanel;
