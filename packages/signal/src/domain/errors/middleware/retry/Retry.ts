import {
	RequestAbortedError,
	RequestFailedError,
	THttpStatusCode,
} from "@alette/pulse";
import * as Duration from "effect/Duration";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { IRetrySettings } from "../RetrySettings";
import { RetryWhenMiddleware } from "../retryWhen/RetryWhenMiddleware";
import { RetryWhenMiddlewareFactory } from "../retryWhen/RetryWhenMiddlewareFactory";
import { retryWhenMiddlewareSpecification } from "../retryWhen/retryWhenMiddlewareSpecification";
import {
	IRetryUnlessStatusConfig,
	IRetryWhenStatusConfig,
} from "./RetryMiddlewareTypes";
import { getRetryConfig } from "./utils";

export const DEFAULT_HTTP_RETRY_STATUSES: THttpStatusCode[] = [
	401, 408, 409, 419, 425, 429, 500, 502, 503, 504,
];

export class Retry<InContext extends IRequestContext> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args?: IRetryUnlessStatusConfig | IRetryWhenStatusConfig,
	) => Retry<_InContext>,
	InContext,
	[
		IRequestContextPatch<{
			accepts: IRetrySettings;
			acceptsMounted: IRetrySettings;
		}>,
	],
	typeof retryWhenMiddlewareSpecification
> {
	protected middlewareSpec = retryWhenMiddlewareSpecification;

	constructor(
		protected override lastArgs:
			| IRetryUnlessStatusConfig
			| IRetryWhenStatusConfig = {
			times: 1,
			whenStatus: DEFAULT_HTTP_RETRY_STATUSES,
		},
	) {
		super((args) => new Retry(args));
	}

	getMiddleware() {
		return new RetryWhenMiddlewareFactory(() => this.getConfiguredRetry());
	}

	protected getConfiguredRetry() {
		const { times, backoff, whenStatus, unlessStatus } = getRetryConfig(
			this.lastArgs,
		);

		const getCurrentBackoff = (attempts: number) => {
			if (!backoff.length) {
				return 0;
			}

			const currentLength =
				attempts >= backoff.length ? backoff.length : attempts;

			return Duration.toMillis(
				Duration.decode(backoff[Math.max(currentLength - 1, 0)] || 0),
			);
		};

		const canRetry = async (attempt: number) => {
			if (attempt > times) {
				return false;
			}

			const backoff = getCurrentBackoff(attempt);
			await new Promise<void>((res) => setTimeout(() => res(), backoff));
			return true;
		};

		return new RetryWhenMiddleware(({ attempt, error }) => {
			if (error instanceof RequestAbortedError) {
				return false;
			}

			if (!(error instanceof RequestFailedError)) {
				return canRetry(attempt);
			}

			const errorStatus = error.getStatus();

			if (!errorStatus) {
				return canRetry(attempt);
			}

			if (whenStatus) {
				return whenStatus.includes(errorStatus) ? canRetry(attempt) : false;
			}

			if (unlessStatus && !unlessStatus.includes(errorStatus)) {
				return canRetry(attempt);
			}

			return false;
		});
	}
}

export const retry = /* @__PURE__ */ new Retry();
