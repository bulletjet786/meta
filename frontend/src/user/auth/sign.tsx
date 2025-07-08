// import { userService } from "@/app/service/user";
import { Button } from "antd";

// https://github.com/vercel/next.js/discussions/72795
// https://github.com/ant-design/ant-design/discussions/52505

// userService.signInWithGoogleOAuth()

export default function Page() {
    return (
        <div>
            <Button onClick={() => {}}>
                Sign in with Google
            </Button>
        </div>
    )
}