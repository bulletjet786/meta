import { useEffect } from "react";
// import { userService } from "../..//service/user";

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <Page/>
    </React.StrictMode>
)

function Page() {
    // useEffect(() => {
    //     userService.authCallback()
    // }, [])

    return (
        <div>
            登录成功！欢迎使用Steam Meta。
        </div>
    )
}