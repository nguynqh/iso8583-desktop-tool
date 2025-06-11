export namespace models {
	
	export class ParsedField {
	    id: number;
	    name: string;
	    value: string;
	
	    static createFrom(source: any = {}) {
	        return new ParsedField(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.value = source["value"];
	    }
	}
	export class ParsedMessage {
	    mti: string;
	    fields: ParsedField[];
	
	    static createFrom(source: any = {}) {
	        return new ParsedMessage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.mti = source["mti"];
	        this.fields = this.convertValues(source["fields"], ParsedField);
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

