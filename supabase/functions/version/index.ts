// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import express from 'express';
import releaseVersion from "./release_version.json" with { type: "json" };

const ChannelHeader = "x-meta-channel"

enum Channel {
  Stable,
  Preview,
  Testing,
  Develop
}

const app = express();
app.use(express.json());
const port = 3000;

app.post("/version/latest/meta/windows-amd64.json", (req: express.Request, res: express.Response) => {
  console.log(`version latest request: ${JSON.stringify(req.body)}, channel: ${req.headers[ChannelHeader]}`);
  let latestVersion: any = null;
  switch (Channel[req.headers[ChannelHeader]]) {
    case Channel.Stable:
      latestVersion = releaseVersion
      break;
    case Channel.Preview:
      latestVersion = releaseVersion
      break;
    case Channel.Testing:
      latestVersion = releaseVersion
      break;
    case Channel.Develop:
      latestVersion = releaseVersion
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
