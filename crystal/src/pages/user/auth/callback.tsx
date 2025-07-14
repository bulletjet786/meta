import {createRoot} from 'react-dom/client'
import { userService } from '../../../service/user'
import React, { useEffect, useState } from 'react';
import { Card, Result } from 'antd';
import Signing from "./signing.tsx";

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <Page/>
    </React.StrictMode>
)


export default function Page() {
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const handleAuth = async () => {
            try {
                await userService.authCallback();
                setSuccess(true);
            } catch (error) {
                console.error('登录失败:', error);
                setSuccess(false);
            } finally {
                setLoading(false);
            }
        };

        handleAuth();
    }, []);

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f0f2f5',
                padding: '20px',
            }}
        >
            <Card
                style={{
                    maxWidth: 480,
                    width: '100%',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
            >
                {loading ? (
                    <Signing/>
                ) : success ? (
                    <Result
                        status="success"
                        title="SignIn Success!"
                        subTitle="The steam translation features is available."
                        extra={[
                        ]}
                    />
                ) : (
                    <Result
                        status="error"
                        title="SignIn Failed!"
                    />
                )}
            </Card>
        </div>
    );
}