// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {models} from '../models';

export function GetSampleMessages():Promise<Array<string>>;

export function GetTemplateName():Promise<string>;

export function GetTemplateStats():Promise<Record<string, any>>;

export function GetTemplateVersion():Promise<string>;

export function LoadTemplate(arg1:string):Promise<void>;

export function ParseLog(arg1:string):Promise<Array<string>>;

export function ParseMessage(arg1:string):Promise<models.ParsedMessage>;

export function ParseMultipleMessages(arg1:Array<string>):Promise<Array<models.ParsedMessage>>;
