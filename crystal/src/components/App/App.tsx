import './App.css'

import {useState} from 'react'

// 模仿 小黑盒的布局

// [史低价格：xxx] [在线人数：xxx] [支持语言：xxx] []
// -价格历史- -多方比价- -促销节点- 

// 价格历史：
// 区域 商店 货币（慢慢增加：仅国区、仅Steam、仅人民币）
// 阶梯线图

// 多方比价：
// - 导航至 杉果
// - 导航至 Game2K等
// - 导航至 其他平台

// 库中
// -攻略论坛- -学习研究- -游戏搭子- -其他资源- -我的笔记- -分享笔记-
// -发布游戏进度到我的描述/心情/状态
// 私服列表，发布我的私服
// 硬件推荐

// 攻略论坛：维护者
// - xxxx
// - xxxx
// + 我有推荐

//
function App() {
    const [count, setCount] = useState(0)

    return (
        <div className="fixedPanel">
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
            </div>
        </div>
    )
}

export default App
