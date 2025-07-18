export namespace appinfo {
	
	export class AppInfo {
	    appid: number;
	    state: number;
	    // Go type: time
	    last_update: any;
	    access_token: number;
	    change_number: number;
	    extended: Record<string, any>;
	
	    static createFrom(source: any = {}) {
	        return new AppInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.appid = source["appid"];
	        this.state = source["state"];
	        this.last_update = this.convertValues(source["last_update"], null);
	        this.access_token = source["access_token"];
	        this.change_number = source["change_number"];
	        this.extended = source["extended"];
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
	    Channel: string;
	    UI: RegularUiSetting;
	
	    static createFrom(source: any = {}) {
	        return new RegularSetting(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Channel = source["Channel"];
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
	    DeepLUnlocked: boolean;
	
	    static createFrom(source: any = {}) {
	        return new TranslateSetting(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Block = this.convertValues(source["Block"], BlockTranslateSetting);
	        this.Selection = this.convertValues(source["Selection"], SelectionTranslateSetting);
	        this.Provider = source["Provider"];
	        this.TargetLanguage = source["TargetLanguage"];
	        this.DeepLUnlocked = source["DeepLUnlocked"];
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

export namespace steam {
	
	export class DisplayAppInfo {
	    app_id: number;
	    display_name: string;
	    install_dir: string;
	
	    static createFrom(source: any = {}) {
	        return new DisplayAppInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.app_id = source["app_id"];
	        this.display_name = source["display_name"];
	        this.install_dir = source["install_dir"];
	    }
	}
	export class LibraryChange {
	    app_id: number;
	    display_name: string;
	
	    static createFrom(source: any = {}) {
	        return new LibraryChange(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.app_id = source["app_id"];
	        this.display_name = source["display_name"];
	    }
	}

}

export namespace user {
	
	export class LoginInfo {
	    sign_in: boolean;
	    plan: string;
	    access_token: string;
	
	    static createFrom(source: any = {}) {
	        return new LoginInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sign_in = source["sign_in"];
	        this.plan = source["plan"];
	        this.access_token = source["access_token"];
	    }
	}

}

