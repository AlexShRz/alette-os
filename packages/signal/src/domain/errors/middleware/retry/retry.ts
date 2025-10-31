import {
	RequestAbortedError,
	RequestFailedError,
	THttpStatusCode,
} from "@alette/pulse";
import * as Duration from "effect/Duration";
import { retryWhen } from "../retryWhen";
import {
	IRetryUnlessStatusConfig,
	IRetryWhenStatusConfig,
} from "./RetryMiddlewareTypes";
import { getRetryConfig } from "./utils";

export const DEFAULT_HTTP_RETRY_STATUSES: THttpStatusCode[] = [
	401, 408, 409, 419, 425, 429, 500, 502, 503, 504,
];

export function retry(
	args: IRetryUnlessStatusConfig | IRetryWhenStatusConfig = {
		times: 1,
		whenStatus: DEFAULT_HTTP_RETRY_STATUSES,
	},
) {
	const { times, backoff, whenStatus, unlessStatus } = getRetryConfig(args);

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

	return retryWhen(({ attempt, error }) => {
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
