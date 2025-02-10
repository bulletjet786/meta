import {Line} from '@ant-design/plots';
import React from 'react';
import {AggGameInfo} from "@/services/itad/price";
import dayjs from "dayjs";

class PriceHistoryPanelProps {
  gameInfo: AggGameInfo

  constructor(gameInfo: AggGameInfo) {
    this.gameInfo = gameInfo
  }
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
    return <Line {...config} />;
  };

export default PriceHistoryPanel;
