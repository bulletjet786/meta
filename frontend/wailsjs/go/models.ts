export namespace machine {
	
	export class Info {
	    id: string;
	    os: string;
	    arch: string;
	
	    static createFrom(source: any = {}) {
	        return new Info(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.os = source["os"];
	        this.arch = source["arch"];
	    }
	}

}

export namespace steam {
	
	export class ServiceOptions {
	    RemoteUrl: string;
	    Os: string;
	
	    static createFrom(source: any = {}) {
	        return new ServiceOptions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.RemoteUrl = source["RemoteUrl"];
	        this.Os = source["Os"];
	    }
	}
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

