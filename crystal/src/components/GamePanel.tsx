import React, {useEffect, useState} from 'react';
import {Segmented} from "antd";
import StudyResourcePanel from "./StudyResource";
import LowestPriceTable from "./LowestPrice.tsx";
import {GameInfo, itadClient} from "../client/itad.ts";
import {fetchLowestGamePriceInfo, LowestGamePriceInfo} from '../client/price';
import { CountryInfo } from '../constants/country';
import {create} from "zustand/react";

type GamePanelProps = {
  appId: string
}

const PriceHistoryTab = "PriceHistory"
const StudyResourceTab = "StudyResource"
const LowestPriceTab = "LowestPrice"

const countries = [
  CountryInfo.CN,
  CountryInfo.AR,
  CountryInfo.RU,
  CountryInfo.TR,
  CountryInfo.US
]

interface GamePanelTableState {
  appId: string
  loading: boolean
  gameInfo: GameInfo | null
  lowestGamePriceInfos: LowestGamePriceInfo[]
  load: (appId: string) => void
}

const useLowestPriceStore = create<GamePanelTableState>()(
  (set) => ({
    appId: "",
    loading: true,
    lowestGamePriceInfos: [],
    gameInfo: null,
    load: async (appId: string) => {
      set({
        appId: appId,
        loading: true
      });
      const gameInfo = await itadClient.lookup(appId);
      if (gameInfo) {
        set({
          gameInfo: gameInfo
        });
        const requests = [];
        for (const country of countries) {
          requests.push(fetchLowestGamePriceInfo(gameInfo.id, country));
        }
        const results = await Promise.all(requests);
        set({
          lowestGamePriceInfos: results.filter(it => it !== null) as LowestGamePriceInfo[],
          loading: false
        });
      }
    }
  })
)

// TODO：
// 1. 修复每次加载切换Tab都会重新加载数据的问题：
// 2. 修复无法获取汇率
// 3. 修复区域货币转换问题：部分区域的货币总是USD： 完成
const GamePanel: React.FC<GamePanelProps> = (props) => {
  const [tab, setTab] = useState(PriceHistoryTab)
  
  const loading = useLowestPriceStore((state) => state.loading)
  const gameInfo = useLowestPriceStore((state) => state.gameInfo)
  const lowestGamePriceInfos = useLowestPriceStore((state) => state.lowestGamePriceInfos)
  const load = useLowestPriceStore((state) => state.load);

  useEffect(() => {
    console.log(`Start fetch aggGameInfo for ${props.appId}`);
    load(props.appId)
  },[]);

  if (loading) {
    return <div>loading...</div>
  }

  const content = () => {
    switch (tab) {
      case LowestPriceTab:
        return <LowestPriceTable lowestGamePriceInfos={lowestGamePriceInfos}></LowestPriceTable>
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
