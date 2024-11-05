export class GAClient {

    private static host: string = "https://p.deckz.fun"

    async sendEvents(clientId: string, events: Event[]) {
        const body = JSON.stringify(
                this.events(clientId, events)
            )
        const requestOptions = {
            method: 'POST',
            body: body,
        };
        console.info(`will send event body: ${body}`)
        await fetch(`${GAClient.host}/ga/mp/collect`, requestOptions);
    }

    events(clientId: string, events: Event[]) {
        return {
            "client_id": clientId,
            "non_personalized_ads": true,
            "events": events
        }
    }
}

export interface Event {
  name: string
  params: any
}

  