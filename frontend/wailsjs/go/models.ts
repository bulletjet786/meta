export namespace common {
	
	export class Status {
	    state: string;
	
	    static createFrom(source: any = {}) {
	        return new Status(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.state = source["state"];
	    }
	}

}

export namespace machine {
	
	export class IdentifyingLanguageTag {
	    language: string;
	    script: string;
	    region: string;
	
	    static createFrom(source: any = {}) {
	        return new IdentifyingLanguageTag(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.language = source["language"];
	        this.script = source["script"];
	        this.region = source["region"];
	    }
	}
	export class Info {
	    device_id: string;
	    launch_id: string;
	    os: string;
	    arch: string;
	    work_dir: string;
	    country: string;
	    language_tag: IdentifyingLanguageTag;
	    version: string;
	
	    static createFrom(source: any = {}) {
	        return new Info(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.device_id = source["device_id"];
	        this.launch_id = source["launch_id"];
	        this.os = source["os"];
	        this.arch = source["arch"];
	        this.work_dir = source["work_dir"];
	        this.country = source["country"];
	        this.language_tag = this.convertValues(source["language_tag"], IdentifyingLanguageTag);
	        this.version = source["version"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace setting {
	
	export class BlockTranslateSetting {
	    AboutGame: boolean;
	    StoreReviews: boolean;
	    CommunityReviews: boolean;
	
	    static createFrom(source: any = {}) {
	        return new BlockTranslateSetting(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.AboutGame = source["AboutGame"];
	        this.StoreReviews = source["StoreReviews"];
	        this.CommunityReviews = source["CommunityReviews"];
	    }
	}
	export class LanguageLabel {
	    Language: string;
	    Label: string;
	
	    static createFrom(source: any = {}) {
	        return new LanguageLabel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Language = source["Language"];
	        this.Label = source["Label"];
	    }
	}
	export class RegularUiSetting {
	    Language: string;
	
	    static createFrom(source: any = {}) {
	        return new RegularUiSetting(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Language = source["Language"];
	    }
	}
	export class RegularSetting {
	    UI: RegularUiSetting;
	
	    static createFrom(source: any = {}) {
	        return new RegularSetting(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.UI = this.convertValues(source["UI"], RegularUiSetting);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class SelectionTranslateSetting {
	    Enabled: boolean;
	
	    static createFrom(source: any = {}) {
	        return new SelectionTranslateSetting(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Enabled = source["Enabled"];
	    }
	}
	export class TranslateSetting {
	    Block: BlockTranslateSetting;
	    Selection: SelectionTranslateSetting;
	    Provider: string;
	    TargetLanguage: string;
	
	    static createFrom(source: any = {}) {
	        return new TranslateSetting(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Block = this.convertValues(source["Block"], BlockTranslateSetting);
	        this.Selection = this.convertValues(source["Selection"], SelectionTranslateSetting);
	        this.Provider = source["Provider"];
	        this.TargetLanguage = source["TargetLanguage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Setting {
	    Translate: TranslateSetting;
	    Regular: RegularSetting;
	
	    static createFrom(source: any = {}) {
	        return new Setting(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Translate = this.convertValues(source["Translate"], TranslateSetting);
	        this.Regular = this.convertValues(source["Regular"], RegularSetting);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

