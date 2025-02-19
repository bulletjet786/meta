// import React from 'react';
// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc';
// import timezone from 'dayjs/plugin/timezone';
//
// dayjs.extend(utc);
// dayjs.extend(timezone);
//
// export class StudyResourcePanelProps {
//   gameName: string
//
//   constructor(gameName: string) {
//     this.gameName = gameName
//   }
// }
//
// const StudyResourcePanel: React.FC<StudyResourcePanelProps> =
//   (props) => {
//     const xianyudanjiUrl = `https://www.xianyudanji.net?aff=270876&s=${encodeURIComponent(props.gameName)}`;
//     const kkyxUrl = `https://www.kkyx.net?aff=8119&s=${encodeURIComponent(props.gameName)}`;
//     const xbgameUrl = `https://www.xbgame.net?s=${encodeURIComponent(props.gameName)}`;
//
//     return (
//       <>
//         <a href={xianyudanjiUrl} target={xianyudanjiUrl}>搜索学习版: 咸鱼单机</a>
//         <a href={kkyxUrl} target={kkyxUrl}>搜索学习版: 游戏仓库</a>
//         <a href={xbgameUrl} target={xbgameUrl}>搜索学习版: 小白游戏网</a>
//       </>)
//   }
//
// export default StudyResourcePanel;
