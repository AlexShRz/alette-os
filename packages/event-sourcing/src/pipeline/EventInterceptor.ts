import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import { IEventBusListenerContext } from "../listeners/EventBusListenerContext.js";

export class EventInterceptor extends Context.Tag("EventInterceptor")<
	EventInterceptor,
	IEventBusListenerContext["next"]
>() {
	static make<A extends IEventBusListenerContext["next"], I, R>(
		interceptor: E.Effect<A, I, R>,
	) {
		return Layer.effect(this, interceptor);
	}
}
