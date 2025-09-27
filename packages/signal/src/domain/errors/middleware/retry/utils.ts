import * as P from "effect/Predicate";
import { TRecognizedApiDuration } from "../../../../shared";
import {
	IRetryUnlessStatusConfig,
	IRetryWhenStatusConfig,
	ISimpleRetryConfig,
	TRetryMiddlewareArgs,
} from "./RetryMiddlewareTypes";

const isConfigWithStatuses = (
	config: TRetryMiddlewareArgs,
): config is ISimpleRetryConfig & {
	whenStatus?: IRetryWhenStatusConfig["whenStatus"];
	unlessStatus?: IRetryUnlessStatusConfig["unlessStatus"];
} =>
	P.hasProperty(config, "whenStatus") || P.hasProperty(config, "unlessStatus");

const getCommon = ({ backoff, times }: TRetryMiddlewareArgs) => {
	return {
		times: Math.max(times || 0, 1),
		backoff: backoff || [],
	};
};

export const getRetryConfig = (
	args: IRetryWhenStatusConfig | IRetryUnlessStatusConfig,
): {
	times: number;
	backoff: TRecognizedApiDuration[];
	whenStatus?: IRetryWhenStatusConfig["whenStatus"];
	unlessStatus?: IRetryUnlessStatusConfig["unlessStatus"];
} => {
	if (isConfigWithStatuses(args)) {
		const { whenStatus, unlessStatus } = args;

		return {
			...getCommon(args),
			...(whenStatus ? { whenStatus } : {}),
			...(unlessStatus ? { unlessStatus } : {}),
		};
	}

	return getCommon(args);
};
