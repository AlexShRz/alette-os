import { RequestFailedError } from "@alette/pulse";
import * as Duration from "effect/Duration";
import { IRequestContext } from "../../../context/IRequestContext";
import { retryWhen } from "../retryWhen";
import {
	IRetryUnlessStatusConfig,
	IRetryWhenStatusConfig,
} from "./RetryMiddlewareTypes";
import { getRetryConfig } from "./utils";

export function retry<C extends IRequestContext>(
	args: IRetryUnlessStatusConfig | IRetryWhenStatusConfig = {},
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

	return retryWhen<C>(({ attempt, error }) => {
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
