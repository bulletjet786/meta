import {createRoot} from 'react-dom/client'
import {userService} from "../../service/user";
import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Button, Result } from 'antd';
const { Title, Paragraph } = Typography;

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
                await userService.authCallback(); // 调用你的登录回调
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
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin size="large" />
                        <Paragraph style={{ marginTop: 16 }}>正在验证您的身份...</Paragraph>
                    </div>
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