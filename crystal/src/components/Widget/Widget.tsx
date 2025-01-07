import './App.css'

import {useState} from 'react'

function Widget() {
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

export default Widget
