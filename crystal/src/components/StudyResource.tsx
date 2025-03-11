import React from 'react';
import { Tag, Card, Space, Typography } from 'antd';

type StudyResourcePanelProps = {
  gameName: string
}

const StudyResourcePanel: React.FC<StudyResourcePanelProps> =
  (props) => {
    const itemProps = buildItemProps(props.gameName)

    return (
      <>
        { itemProps.map((props, _) => <StudyResourceItem {...props} />) }
      </>
    )
  }


function buildItemProps(gameName: string): StudyResourceItemProps[]{
  return [
    {
      name: "搜索: 咸鱼单机网",
      url: `https://www.xianyudanji.net?aff=270876&s=${encodeURIComponent(gameName)}`,
      tags: ["部分免费", "月卡39", "永久49", "签到0.3", "百度", "夸克", "123", "UC-不限速"],
    },
    {
      name: "搜索: 游戏仓库网",
      url: `https://www.kkyx.net?aff=8119&s=${encodeURIComponent(gameName)}`,
      tags: ["部分免费", "月卡28", "年卡48", "永久68", "签到+1", "百度", "天翼-高速", "迅雷"],
    },
    {
      name: "搜索: 小白游戏网",
      url: `https://www.xbgame.net?s=${encodeURIComponent(gameName)}`,
      tags: ["2区免费", "月卡28", "季卡38", "年卡68", "永久98", "百度", "迅雷", "夸克", "天翼-高速", "阿里", "UC-不限速"],
    },
  ]
}

type StudyResourceItemProps = {
  name: string,
  url: string,
  tags: string[]
}

const StudyResourceItem: React.FC<StudyResourceItemProps> =
  (props: StudyResourceItemProps) => {
    return (
      <Card >
      <Space direction="vertical" size="middle">
        <Typography.Link href={ props.url } >
          { props.name }
        </Typography.Link>
        <div>
          {props.tags.map((tag, index) => (
            <Tag key={index}>
              {tag}
            </Tag>
          ))}
        </div>
      </Space>
    </Card>
    )
  }

export default StudyResourcePanel;
