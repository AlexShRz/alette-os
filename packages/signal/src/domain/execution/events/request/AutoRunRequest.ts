import { RunRequest } from "./RunRequest";

/**
 * 1. Like RunRequest, but spawned by middleware ONLY.
 * 2. This version is used mostly when we want to retry
 * the request while preserving current context.
 * 3. Other middleware like debounce()/throttle()/path(), etc.,
 * will not react to this event, and this is by design. They must
 * not interfere with it.
 * 4. This event CAN be cancelled by event interceptor if it contains
 * an out-of-date request id.
 * */
export class AutoRunRequest extends RunRequest {
	/**
	 * Must mimic RunRequest clone()
	 * */
	protected override _clone() {
		const self = new AutoRunRequest(this.settingSupplier);
		return self as this;
	}
}
