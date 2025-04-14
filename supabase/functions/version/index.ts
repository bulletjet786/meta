// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import express from 'express';

const ChannelHeader = "x-meta-channel"

interface LatestVersionRequest {
  deviceId: string;
  currentVersion: string;
}

enum Channel {
  Stable,
  Preview,
  Testing,
  Develop
}

const app = express();
app.use(express.json());
const port = 3000;

app.post("/version/latest", (req: express.Request, res: express.Response) => {
  console.log(`version latest request: ${JSON.stringify(req.body)}, channel: ${req.headers[ChannelHeader]}`);
  let latestVersion: any = null;
  switch (Channel[req.headers[ChannelHeader]]) {
    case Channel.Stable:
      latestVersion = {
        Version: "0.0.3",
        Sha256: "https://dl.meta.deckz.fun/releases/v0.0.4",
      }
      break;
    case Channel.Preview:
      latestVersion = {
        Version: "0.0.3",
        Sha256: "https://dl.meta.deckz.fun/releases/v0.0.4",
      }
      break;
    case Channel.Testing:
      latestVersion = {
        Version: "0.0.3",
        Sha256: "https://dl.meta.deckz.fun/releases/v0.0.4",
      }
      break;
    case Channel.Develop:
      latestVersion = {
        Version: "0.0.4",
        Sha256: "wQIoy55uuB6W7A1e0RB3AC9kbHje96NGLZ5MTRFvW+A=",
      }
      break;
    default:
      res.status(400).end();
      break;
  }
  res.send(latestVersion);
});

app.listen(port, () => {
  console.log(`Version app listening on port ${port}`);
});
