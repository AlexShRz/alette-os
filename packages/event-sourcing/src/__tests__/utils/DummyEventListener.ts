import { BusEvent } from "../../events/BusEvent.js";
import {
	BusEventListener,
	BusEventListenerContext,
} from "../../listeners/BusEventListener.js";

export class DummyEventListener extends BusEventListener {
	protected apply(event: BusEvent, { next }: BusEventListenerContext) {
		return next(event);
	}

	clone() {
		return new DummyEventListener(this.sendToEventBus) as this;
	}
}
