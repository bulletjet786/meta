import React, {useEffect, useState} from 'react';
import {Segmented} from "antd";
import StudyResourcePanel from "./StudyResource";
import LowestPriceTable from "./LowestPrice.tsx";
import {GameInfo, itadClient} from "../client/itad.ts";

type GamePanelProps = {
  appId: string
}

const PriceHistoryTab = "PriceHistory"
const StudyResourceTab = "StudyResource"
const LowestPriceTab = "LowestPrice"

// TODO：
// 1. 修复每次加载切换Tab都会重新加载数据的问题
// 2. 修复无法获取汇率：
// 3. 修复区域货币转换问题：部分区域的货币总是USD
const GamePanel: React.FC<GamePanelProps> = (props) => {
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(PriceHistoryTab)
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  useEffect(() => {
    console.log(`Start fetch aggGameInfo for ${props.appId}`);
    itadClient.lookup(props.appId).then(data => {
      if (data) {
        setGameInfo(data);
        setLoading(false)
      }
    })
  },[]);

  if (loading) {
    return <div>loading...</div>
  }

  const content = () => {
    switch (tab) {
      case LowestPriceTab:
        return <LowestPriceTable itadId={gameInfo!.id!}></LowestPriceTable>
      // case PriceHistoryTab:
      //   return <PriceHistoryPanel gameInfo={gameInfo!}/>
      case StudyResourceTab:
        return <StudyResourcePanel gameName={gameInfo!.slug!}/>

    }
  }

  return (
    <div>
      <div>
        <Segmented
          block
          options={
            [
              {
                label: (
                  <div style={{padding: 4}} onClick={() => {
                    setTab(LowestPriceTab)
                  }}>
                    <div>史低价格</div>
                  </div>
                ),
                value: 'price',
              },
              {
                label: (
                  <div style={{padding: 4}} onClick={() => {
                    setTab(StudyResourceTab)
                  }}>
                    <div>学习研究</div>
                  </div>
                ),
                value: 'study',
              },
            ]}
        />
      </div>

      {content()}
    </div>
  )
}

export default GamePanel;
