import { RequestSessionEvent } from "../../execution/events/RequestSessionEvent";

export class RequestWasMounted extends RequestSessionEvent {
	protected _clone() {
		return new RequestWasMounted() as this;
	}
}
