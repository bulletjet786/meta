import React, {useEffect} from 'react';
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
  tab: string
  changeTab: (tab: string) => void
  gameInfo: GameInfo | null
  lowestGamePriceInfos: LowestGamePriceInfo[]
  load: (appId: string) => void
}

const useLowestPriceStore = create<GamePanelTableState>()(
  (set) => ({
    appId: "",
    loading: true,
    tab: LowestPriceTab,
    changeTab: (tab: string) => {
      set({
        tab: tab
      })
    },
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
// 1. 修复每次只有切换Tab都会才会显示 LowestPriceTable 的问题：
const GamePanel: React.FC<GamePanelProps> = (props) => {
  const tab = useLowestPriceStore((state) => state.tab)
  const changeTab = useLowestPriceStore((state) => state.changeTab)
  
  const loading = useLowestPriceStore((state) => state.loading)
  const gameInfo = useLowestPriceStore((state) => state.gameInfo)
  const lowestGamePriceInfos = useLowestPriceStore((state) => state.lowestGamePriceInfos)
  const load = useLowestPriceStore((state) => state.load);

  useEffect(() => {
    console.log(`Start fetch gameInfo and lowestGamePriceInfos for ${props.appId}`);
    load(props.appId)
  },[]);

  if (loading) {
    return <div></div>
  }

  const content = () => {
    switch (tab) {
      case LowestPriceTab:
        return <LowestPriceTable lowestGamePriceInfos={lowestGamePriceInfos}></LowestPriceTable>
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
                    changeTab(LowestPriceTab)
                  }}>
                    <div>史低价格</div>
                  </div>
                ),
                value: 'price',
              },
              {
                label: (
                  <div style={{padding: 4}} onClick={() => {
                    changeTab(StudyResourceTab)
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
