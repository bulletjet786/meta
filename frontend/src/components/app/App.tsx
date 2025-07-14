import Guide from "../page/Guide";
import {Avatar, ConfigProvider, Layout, Menu, MenuProps} from "antd";
import { UserOutlined } from '@ant-design/icons';
import React, {useEffect, useState} from "react";
import { useTranslation } from "react-i18next";
import Setting from "../page/Setting";
import About from "../page/About";
import {SignIn, GetLoginInfo} from "../../../wailsjs/go/user/Service";
import {user} from "../../../wailsjs/go/models";
import LoginInfo = user.LoginInfo;
import LoginPage from "./Login";
import {EventsOff, EventsOn} from "../../../wailsjs/runtime";
import {UserLoginInfoEvent} from "../../constants/constants";
import Beta from "../page/Beta";

const { Sider, Content } = Layout;
type MenuItem = Required<MenuProps>['items'][number];

const blueColorPrimary = "#1677ff"
const pinkColorPrimary = "#722ed1"

function App() {

    const { t } = useTranslation();

    const [menuSelect, setMenuSelect] = useState("guide")
    const [loginInfo, setLoginInfo] = useState<LoginInfo | null>(null)
    useEffect(() => {
            GetLoginInfo().then(
                (loginInfo) => {
                    setLoginInfo(loginInfo)
                }
            )
            EventsOn(UserLoginInfoEvent, (loginInfo) => {
                console.log("Received UserLoginInfoEvent loginInfo: " + JSON.stringify(loginInfo))
                setLoginInfo(loginInfo)
            })
            return () => {
                EventsOff(UserLoginInfoEvent);
            }
        },
        []
    )

    const items: MenuItem[] = [
        { key: 'guide', label: t('guide.name') },
        { key: 'setting', label: t('setting.name')},
        { key: 'beta', label: t('beta.name')},
        { key: 'about', label: t('about.name') },
      ];

    // if (!loginInfo || !(loginInfo!).sign_in) {
    //     return <LoginPage/>
    // }

    let content = (<div></div>)
    switch (menuSelect) {
        case "guide":
            content = <Guide />
            break;
        case "setting":
            content = <Setting />
            break;
        case "beta":
            content = <Beta />
            break
        case "about":
            content = <About />
            break;
    }

    return (
        <div id='app' style={{height: '100%', width: '100%', minHeight: '100%', minWidth: '100%'}}>
            <ConfigProvider theme={
                {
                    token: {
                        colorPrimary: pinkColorPrimary,
                    },
                }
            }>
                <Layout style={{height: '100%', width: '100%'}}>
                    <Sider width='100px' style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    }}>
                        <Menu
                            style={{height: '100%'}}
                            defaultSelectedKeys={[menuSelect]}
                            mode="inline"
                            items={items}
                            onClick={
                                ({ key, keyPath, domEvent }) => {
                                    setMenuSelect(key)
                                }
                            }
                        />

                        {/*<div*/}
                        {/*    style={{*/}
                        {/*        height: '10%',*/}
                        {/*        backgroundColor: "#ffffff",*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    <Avatar*/}
                        {/*        size='large'*/}
                        {/*        icon={ <UserOutlined /> }*/}
                        {/*        onClick={*/}
                        {/*            () => {*/}
                        {/*                SignIn()*/}
                        {/*            }*/}
                        {/*        }*/}
                        {/*    />*/}
                        {/*    /!*<Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />*!/*/}
                        {/*</div>*/}
                    </Sider>
                    <Content>
                        {content}
                    </Content>
                </Layout>
            </ConfigProvider>
        </div>
    )
}

export default App

