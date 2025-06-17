export namespace main {
	
	export class Message {
	    content: string;
	    description: string;
	
	    static createFrom(source: any = {}) {
	        return new Message(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.content = source["content"];
	        this.description = source["description"];
	    }
	}

}

export namespace models {
	
	export class BitmapInfo {
	    hexValue: string;
	    binaryValue: string;
	    presentFields: number[];
	    isValid: boolean;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new BitmapInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.hexValue = source["hexValue"];
	        this.binaryValue = source["binaryValue"];
	        this.presentFields = source["presentFields"];
	        this.isValid = source["isValid"];
	        this.error = source["error"];
	    }
	}
	export class ParsedField {
	    id: number;
	    name: string;
	    value: string;
	    fieldType: string;
	    maxLength: number;
	    actualLength: number;
	    pattern: string;
	    isValid: boolean;
	    error?: string;
	    isPresentInBitmap: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ParsedField(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.value = source["value"];
	        this.fieldType = source["fieldType"];
	        this.maxLength = source["maxLength"];
	        this.actualLength = source["actualLength"];
	        this.pattern = source["pattern"];
	        this.isValid = source["isValid"];
	        this.error = source["error"];
	        this.isPresentInBitmap = source["isPresentInBitmap"];
	    }
	}
	export class ParsedMessage {
	    mti: string;
	    format: string;
	    bitmap?: BitmapInfo;
	    fields: ParsedField[];
	    isValid: boolean;
	    errorCount: number;
	    parsedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new ParsedMessage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.mti = source["mti"];
	        this.format = source["format"];
	        this.bitmap = this.convertValues(source["bitmap"], BitmapInfo);
	        this.fields = this.convertValues(source["fields"], ParsedField);
	        this.isValid = source["isValid"];
	        this.errorCount = source["errorCount"];
	        this.parsedAt = source["parsedAt"];
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

