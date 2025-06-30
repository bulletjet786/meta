"use client";

// import "@and-design/v5-patch-for-react-19";
import { userService } from "@/app/service/user";
import { Button } from "antd";

// https://github.com/vercel/next.js/discussions/72795
// https://github.com/ant-design/ant-design/discussions/52505

export default function Page() {
    return (
        <div>
            <Button onClick={() => userService.signInWithGoogleOAuth()}>
                Sign in with Google
            </Button>
        </div>
    )
}

