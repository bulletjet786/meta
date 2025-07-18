import React from 'react';
import GamePanel from "./GamePanel.tsx";
import {ConfigProvider, theme} from "antd";
import r2wc from '@r2wc/react-to-web-component'
import { defineWc } from './utils.ts'


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

type CrystalGamePanelProps = {
  appId: string,
  gameName: string
}

const CrystalGamePanel: React.FC<CrystalGamePanelProps> = (props: CrystalGamePanelProps) => {

  return (
    <div>
      <ConfigProvider theme={{algorithm: [theme.darkAlgorithm, theme.compactAlgorithm]}}>
        <GamePanel appId={ props.appId } gameName={ props.gameName }></GamePanel>
      </ConfigProvider>
    </div>
  )
};

export default CrystalGamePanel;

export const CrystalGamePanelWcName = "crystal-game-panel"

export const CrystalGamePanelWc = r2wc(CrystalGamePanel, {
    props: {
        appId: "string",
        gameName: "string"
    },
    // null: don't use shadow, ant design can inject styles to head.style 
    // open mode: we can inject styles
    // shadow: "open", 
})

export function defineCrystalGamePanelWc() {
    defineWc(CrystalGamePanelWcName, CrystalGamePanelWc)
}