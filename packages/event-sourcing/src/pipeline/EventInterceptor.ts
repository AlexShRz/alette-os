import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import { IEventBusListenerContext } from "../listeners/EventBusListenerContext.js";

export class EventInterceptor extends Context.Tag("EventInterceptor")<
	EventInterceptor,
	IEventBusListenerContext["next"]
>() {
	static make(interceptor: IEventBusListenerContext["next"]) {
		return Layer.effect(this, E.succeed(interceptor));
	}
}
