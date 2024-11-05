"use client";

// import "@and-design/v5-patch-for-react-19";
import { useEffect } from "react";
import { userService } from "@/app/service/user";

export default function Page() {
    useEffect(() => {
        userService.authCallback()
    }, [])

    return (
        <div>
            登录成功！欢迎使用Steam Meta。
        </div>
    )
}

