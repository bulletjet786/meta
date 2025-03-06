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
	
	export class Info {
	    device_id: string;
	    launch_id: string;
	    os: string;
	    arch: string;
	
	    static createFrom(source: any = {}) {
	        return new Info(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.device_id = source["device_id"];
	        this.launch_id = source["launch_id"];
	        this.os = source["os"];
	        this.arch = source["arch"];
	    }
	}

}

