import React, {useEffect, useState} from 'react';
import {Segmented} from "antd";
import {AggGameInfo, fetchAggGameInfo} from "../client/price";
import PriceHistoryPanel from "./PriceHistoryChart";
import StudyResourcePanel from "./StudyResource";

type GamePanelProps = {
  appId: string
}

const PriceHistoryTab = "PriceHistory"
const StudyResourceTab = "StudyResource"

const GamePanel: React.FC<GamePanelProps> = (props) => {
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(PriceHistoryTab)
  const [gameInfo, setGameInfo] = useState<AggGameInfo | null>(null);
  useEffect(() => {
    console.log(`Start fetch aggGameInfo for ${props.appId}`);
    fetchAggGameInfo(props.appId).then(data => {
      if (data) {
        setGameInfo(data);
        setLoading(false)
      }
    });
  });

  if (loading) {
    return <div>loading...</div>
  }

  const content = () => {
    switch (tab) {
      case PriceHistoryTab:
        return <PriceHistoryPanel gameInfo={gameInfo!}/>
      case StudyResourceTab:
        return <StudyResourcePanel gameName={gameInfo!.basic.slug!}/>
    }
  }

  return (
    <div>
      <div>
        <Segmented
          options={
            [
              {
                label: (
                  <div style={{padding: 4}} onClick={() => {
                    setTab(PriceHistoryTab)
                  }}>
                    <div>史低价格</div>
                    <div>{gameInfo?.storeLow.price}</div>
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
                    l
                  </div>
                ),
                value: 'online',
              },
            ]}
        />
      </div>

      {content()}
    </div>
  )
}

export default GamePanel;
