export namespace models {
	
	export class ValidationError {
	    fieldId: number;
	    fieldName: string;
	    errorType: string;
	    expected: string;
	    actual: string;
	    severity: string;
	    message: string;
	    ruleApplied: string;
	
	    static createFrom(source: any = {}) {
	        return new ValidationError(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.fieldId = source["fieldId"];
	        this.fieldName = source["fieldName"];
	        this.errorType = source["errorType"];
	        this.expected = source["expected"];
	        this.actual = source["actual"];
	        this.severity = source["severity"];
	        this.message = source["message"];
	        this.ruleApplied = source["ruleApplied"];
	    }
	}
	export class ParsedField {
	    id: number;
	    name: string;
	    value: string;
	    description: string;
	    fieldType: string;
	    maxLength: number;
	    actualLength: number;
	    pattern: string;
	    isValid: boolean;
	    errors?: ValidationError[];
	    warnings?: ValidationError[];
	    parseMethod: string;
	
	    static createFrom(source: any = {}) {
	        return new ParsedField(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.value = source["value"];
	        this.description = source["description"];
	        this.fieldType = source["fieldType"];
	        this.maxLength = source["maxLength"];
	        this.actualLength = source["actualLength"];
	        this.pattern = source["pattern"];
	        this.isValid = source["isValid"];
	        this.errors = this.convertValues(source["errors"], ValidationError);
	        this.warnings = this.convertValues(source["warnings"], ValidationError);
	        this.parseMethod = source["parseMethod"];
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
	export class ValidationSummary {
	    totalFields: number;
	    validFields: number;
	    errorCount: number;
	    warningCount: number;
	    fieldsCoverage: number;
	    validationScore: number;
	    missingRequired?: number[];
	    unknownFields?: number[];
	
	    static createFrom(source: any = {}) {
	        return new ValidationSummary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.totalFields = source["totalFields"];
	        this.validFields = source["validFields"];
	        this.errorCount = source["errorCount"];
	        this.warningCount = source["warningCount"];
	        this.fieldsCoverage = source["fieldsCoverage"];
	        this.validationScore = source["validationScore"];
	        this.missingRequired = source["missingRequired"];
	        this.unknownFields = source["unknownFields"];
	    }
	}
	export class ParsedMessage {
	    mti: string;
	    mtiDescription: string;
	    fields: ParsedField[];
	    fieldCount: number;
	    templateName: string;
	    isValid: boolean;
	    validationSummary: ValidationSummary;
	    parsedAt: string;
	    parsingMethod: string;
	
	    static createFrom(source: any = {}) {
	        return new ParsedMessage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.mti = source["mti"];
	        this.mtiDescription = source["mtiDescription"];
	        this.fields = this.convertValues(source["fields"], ParsedField);
	        this.fieldCount = source["fieldCount"];
	        this.templateName = source["templateName"];
	        this.isValid = source["isValid"];
	        this.validationSummary = this.convertValues(source["validationSummary"], ValidationSummary);
	        this.parsedAt = source["parsedAt"];
	        this.parsingMethod = source["parsingMethod"];
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

