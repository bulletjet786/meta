export type StoreExtensionOptions = {
    gamePanel: StoreGamePanelOptions
}

export class StoreExtension {

}

export class StoreGamePanelOptions {
    constructor(
        public enable: boolean = true,
        public useDebugAppId: string | null = null,
        public enableHistoryPriceCharts: boolean = true,
        public deckSN: string = "deck:Unknown",
        public deviceId: string = "Unknown",
    ) {
    }
}
