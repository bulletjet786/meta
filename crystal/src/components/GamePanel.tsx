import React, {useEffect} from 'react';
import {Segmented, Tooltip} from "antd";
import StudyResourcePanel from "./StudyResource";
import LowestPriceTable from "./LowestPrice.tsx";
import {GameInfo, itadClient} from "../client/itad.ts";
import {fetchLowestGamePriceInfo, LowestGamePriceInfo} from '../client/price';
import { CountryInfo } from '../constants/country';
import {create} from "zustand/react";
import {InfoCircleOutlined} from "@ant-design/icons";

type GamePanelProps = {
  appId: string
  gameName: string
}

const StudyResourceTab = "StudyResource"
const LowestPriceTab = "LowestPrice"

const countries = [
  CountryInfo.CN,
  CountryInfo.AR,
  CountryInfo.RU,
  CountryInfo.TR,
  CountryInfo.US,
  CountryInfo.UA,
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

const GamePanel: React.FC<GamePanelProps> = (props) => {
  const tab = useLowestPriceStore((state) => state.tab)
  const changeTab = useLowestPriceStore((state) => state.changeTab)
  
  const loading = useLowestPriceStore((state) => state.loading)
  // const gameInfo = useLowestPriceStore((state) => state.gameInfo)
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
        return <StudyResourcePanel gameName={props.gameName}/>
    }
  }

  // const contentHeight = 37 * (5 + 1)

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
                    <div>
                      <span>史低价格</span>
                      <Tooltip title="数据来源于：IsThereAnyDeal，Steam伴侣不对数据准确性负责">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </div>
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

      {/*<div style={{ width: "100%", height: `${contentHeight}` + "px" }}>*/}
      <div>
        {content()}
      </div>

    </div>
  )
}

export default GamePanel;
