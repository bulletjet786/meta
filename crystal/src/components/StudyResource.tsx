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
      name: "搜索学习版: 咸鱼单机",
      url: `https://www.xianyudanji.net?aff=270876&s=${encodeURIComponent(gameName)}`,
      tags: ["免费","付费","百度网盘"],
    },
    {
      name: "搜索学习版: 游戏仓库",
      url: `https://www.kkyx.net?aff=8119&s=${encodeURIComponent(gameName)}`,
      tags: ["月卡28", "年卡48", "永久68", "签到+1", "百度云盘", "天翼云盘", "迅雷云盘"],
    },
    {
      name: "搜索学习版: 小白游戏网",
      url: `https://www.xbgame.net?s=${encodeURIComponent(gameName)}`,
      tags: ["永久49", "签到+0.3", "百度网盘"],
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
      <Card style={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Typography.Link href={ props.url } target="_blank" style={{ fontSize: '18px', fontWeight: 'bold' }}>
          { props.name }
        </Typography.Link>
        <div>
          {props.tags.map((tag, index) => (
            <Tag key={index} color="blue" style={{ marginRight: '8px', marginBottom: '8px' }}>
              {tag}
            </Tag>
          ))}
        </div>
      </Space>
    </Card>
    )
  }

export default StudyResourcePanel;
