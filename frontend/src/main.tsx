import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import App from './components/app/App'
import "./i18n/i18n"

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <div style={{height: '560px', width: '100%'}}>
            <App/>
        </div>
    </React.StrictMode>
)
