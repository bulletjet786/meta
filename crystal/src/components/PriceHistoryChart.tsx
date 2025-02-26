import {Line} from '@ant-design/plots';
import React from 'react';
import {AggGameInfo} from "../client/price";
import dayjs from "dayjs";

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

    // 如何处理时间：https://ant-design-charts.antgroup.com/zh/examples/statistics/line#connect-nulls
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
            {gameInfo?.storeLow.price ? `$${gameInfo.storeLow.price}` : '暂无数据'}
          </Tag>
        </Text>
        <Line {...config} />
      </>
    );
  };

export default PriceHistoryPanel;
