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

export namespace types {
	
	export class Factor {
	    id: number[];
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	    status: string;
	    friendly_name?: string;
	    factor_type: string;
	
	    static createFrom(source: any = {}) {
	        return new Factor(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.status = source["status"];
	        this.friendly_name = source["friendly_name"];
	        this.factor_type = source["factor_type"];
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
	export class Identity {
	    id: string;
	    user_id: number[];
	    identity_data?: Record<string, any>;
	    provider: string;
	    // Go type: time
	    last_sign_in_at?: any;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Identity(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.user_id = source["user_id"];
	        this.identity_data = source["identity_data"];
	        this.provider = source["provider"];
	        this.last_sign_in_at = this.convertValues(source["last_sign_in_at"], null);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
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
	export class User {
	    id: number[];
	    aud: string;
	    role: string;
	    email: string;
	    // Go type: time
	    email_confirmed_at?: any;
	    // Go type: time
	    invited_at?: any;
	    phone: string;
	    // Go type: time
	    phone_confirmed_at?: any;
	    // Go type: time
	    confirmation_sent_at?: any;
	    // Go type: time
	    recovery_sent_at?: any;
	    new_email?: string;
	    // Go type: time
	    email_change_sent_at?: any;
	    new_phone?: string;
	    // Go type: time
	    phone_change_sent_at?: any;
	    // Go type: time
	    reauthentication_sent_at?: any;
	    // Go type: time
	    last_sign_in_at?: any;
	    app_metadata: Record<string, any>;
	    user_metadata: Record<string, any>;
	    factors?: Factor[];
	    identities: Identity[];
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	    // Go type: time
	    banned_until?: any;
	    // Go type: time
	    confirmed_at: any;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.aud = source["aud"];
	        this.role = source["role"];
	        this.email = source["email"];
	        this.email_confirmed_at = this.convertValues(source["email_confirmed_at"], null);
	        this.invited_at = this.convertValues(source["invited_at"], null);
	        this.phone = source["phone"];
	        this.phone_confirmed_at = this.convertValues(source["phone_confirmed_at"], null);
	        this.confirmation_sent_at = this.convertValues(source["confirmation_sent_at"], null);
	        this.recovery_sent_at = this.convertValues(source["recovery_sent_at"], null);
	        this.new_email = source["new_email"];
	        this.email_change_sent_at = this.convertValues(source["email_change_sent_at"], null);
	        this.new_phone = source["new_phone"];
	        this.phone_change_sent_at = this.convertValues(source["phone_change_sent_at"], null);
	        this.reauthentication_sent_at = this.convertValues(source["reauthentication_sent_at"], null);
	        this.last_sign_in_at = this.convertValues(source["last_sign_in_at"], null);
	        this.app_metadata = source["app_metadata"];
	        this.user_metadata = source["user_metadata"];
	        this.factors = this.convertValues(source["factors"], Factor);
	        this.identities = this.convertValues(source["identities"], Identity);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.banned_until = this.convertValues(source["banned_until"], null);
	        this.confirmed_at = this.convertValues(source["confirmed_at"], null);
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
	export class Session {
	    access_token: string;
	    refresh_token: string;
	    token_type: string;
	    expires_in: number;
	    expires_at: number;
	    user: User;
	
	    static createFrom(source: any = {}) {
	        return new Session(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.access_token = source["access_token"];
	        this.refresh_token = source["refresh_token"];
	        this.token_type = source["token_type"];
	        this.expires_in = source["expires_in"];
	        this.expires_at = source["expires_at"];
	        this.user = this.convertValues(source["user"], User);
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

