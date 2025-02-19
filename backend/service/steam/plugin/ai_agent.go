package plugin

import (
	"context"

	"github.com/chromedp/cdproto/target"
	"github.com/chromedp/chromedp"
)

type AiAgentPlugin struct {

}

func NewAiAgentPlugin() *AiAgentPlugin {
	return &AiAgentPlugin{
		
	}
}

func (p *AiAgentPlugin) Name() string {
	return "AiAgentPlugin"
}

func (p *AiAgentPlugin) Init() error {
	return nil
}

func (p *AiAgentPlugin) Run(chromeCtx context.Context) {
	// just install listener to watch new target creation events
	// when chromeCtx cancelled, listening will exit
	chromedp.ListenTarget(chromeCtx, func(ev interface{}) {
		switch ev.(type) {
		case *target.EventTargetCreated:
			go func() {

			}()
		}
	})
}

