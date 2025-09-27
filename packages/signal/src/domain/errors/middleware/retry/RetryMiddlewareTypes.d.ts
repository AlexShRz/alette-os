import { THttpStatusCode } from "@alette/pulse";
import { TRecognizedApiDuration } from "../../../../shared";

export interface ISimpleRetryConfig {
	times?: number;
	backoff?: TRecognizedApiDuration[];
}

export interface IRetryUnlessStatusConfig extends ISimpleRetryConfig {
	unlessStatus?: THttpStatusCode[];
}

export interface IRetryWhenStatusConfig extends ISimpleRetryConfig {
	whenStatus?: THttpStatusCode[];
}

export type TRetryMiddlewareArgs =
	| IRetryUnlessStatusConfig
	| IRetryWhenStatusConfig;
