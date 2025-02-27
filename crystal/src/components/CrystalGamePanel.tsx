import React from 'react';
import { StyleProvider } from '@ant-design/cssinjs';
import GamePanel from "./GamePanel.tsx";

import { StyleProvider } from '@ant-design/cssinjs';
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
  appId: string
}

const CrystalGamePanel: React.FC<CrystalGamePanelProps> = (props: CrystalGamePanelProps) => {

  // const containerCss = {
  //   width: '800px',
  //   height: '400px',
  // }

  return (
      // <div style={containerCss}>
    <div>
      <StyleProvider>
        <GamePanel appId={ props.appId }></GamePanel>
      </StyleProvider>
    </div>
  )
};

export default CrystalGamePanel;
