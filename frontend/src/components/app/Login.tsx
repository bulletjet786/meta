import React from 'react';
import { Button, Card, Typography, Avatar, Space, Layout } from "antd";
import { LockOutlined } from '@ant-design/icons';
import {SignIn} from "../../../wailsjs/go/user/Service";

const { Title, Text } = Typography;
const { Content } = Layout;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22px" height="22px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.655-3.356-11.303-8H6.306C9.656,39.663,16.318,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.636,44,31.125,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

export default function LoginPage() {
    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card
                    style={{
                        width: '100%',
                        maxWidth: 400,
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        borderRadius: '16px',
                        padding: '24px 16px'
                    }}
                >
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Avatar size={64} icon={<LockOutlined />} style={{ backgroundColor: '#1677ff' }} />

                        <div style={{ marginBottom: 16 }}>
                            <Title level={2} style={{ marginBottom: 8 }}>
                                欢迎来到 SteamMeta
                            </Title>
                            <Text type="secondary">
                                登录以解锁您的专属翻译与增强功能
                            </Text>
                        </div>

                        <Button
                            type="default"
                            size="large"
                            block
                            icon={<GoogleIcon />}
                            onClick={() => SignIn()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 500
                            }}
                        >
                            <span style={{ marginLeft: 8 }}>Sign in with Google</span>
                        </Button>
                    </Space>
                </Card>
            </Content>
        </Layout>
    );
}
