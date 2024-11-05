export class GAClient {

    private static host: string = "https://p.deckz.fun"

    async sendEvents(clientId: string, events: Event[]) {
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify([
                this.events(clientId, events)
            ]),
        };
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

  