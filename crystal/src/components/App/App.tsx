import './App.css'

import {useState} from 'react'
import EChartsReact from "echarts-for-react";

function App() {
    const [count, setCount] = useState(0)

    const options = {
        grid: {top: 8, right: 8, bottom: 24, left: 36},
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: {
            type: 'value',
        },
        series: [
            {
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                type: 'line',
                smooth: true,
            },
        ],
        tooltip: {
            trigger: 'axis',
        },
    };

    return (
        <div className="fixedPanel">
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
            </div>
            <EChartsReact option={options}/>;
        </div>
    )
}

export default App
