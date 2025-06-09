

export interface TranslateProvider{
    translate(fromText: string): Promise<string | null>;
    translateXML(fromText: string): Promise<string | null>
}