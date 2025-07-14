import { Card, Typography, Spin } from "antd";

const { Title } = Typography;


export default function Signing()  {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            backgroundColor: '#f0f2f5'
        }}>
            <Card
                style={{
                    maxWidth: 480,
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
            >
                <Spin size="large"/>
                <Title level={2} style={{marginTop: 16}}>
                    Signing in...
                </Title>
            </Card>
        </div>
    );
}