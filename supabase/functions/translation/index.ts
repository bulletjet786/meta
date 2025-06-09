// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import express from 'express';
import { xiaoNiuClient } from './client/translate/xiaoniu';

interface TranslateRequest {
  provider: TranslateProvider;
  toLanguage: string;
  type: string;
  text: TextContentRequest;
  html: HtmlContentRequest;
}

enum ContentType {
  Text,
  Html
}

interface TextContentRequest {
  from: string;
}

class TranslateResponse {
  constructor(
    type: ContentType,
    text: TextContentResponse,
  ) {}
}

class TextContentResponse {
  constructor(
    public to: string,
  ) {}
}

interface HtmlContentRequest {
  from: string;
}

enum TranslateProvider {
  XiaoNiu,
  DeepL,
  OpenAI,
  Google,
  Bing,
}

const app = express();
app.use(express.json());
const port = 3000;

app.post("/translation/translate", async (req: express.Request, res: express.Response) => {
  const request = req.body as TranslateRequest;
  let toText: string | null = null;
  switch (request.provider) { 
    case TranslateProvider.XiaoNiu:
      toText = await xiaoNiuClient.translate("Hello World");
      break;
    case TranslateProvider.DeepL:
      break;
    case TranslateProvider.OpenAI:
      break;
    case TranslateProvider.Google:
      break;
    case TranslateProvider.Bing:
      break;
    default:
      res.status(400).send("Invalid provider");
  }
  if (toText == null) {
    res.status(500).send("Translation failed");
    return;
  }
  return res.status(200).send(new TranslateResponse(
    ContentType.Text,
    new TextContentResponse(
      toText,
    ),
  ));
});

app.listen(port, () => {
  console.log(`Version app listening on port ${port}`);
});
