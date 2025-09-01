import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import { IEventBusListenerContext } from "../listeners/EventBusListenerContext.js";

export type TEventInterceptor = IEventBusListenerContext["next"];

export const EventInterceptorTag = "EventInterceptor" as const;

export class EventInterceptor extends Context.Tag(EventInterceptorTag)<
	EventInterceptor,
	TEventInterceptor
>() {
	static make(interceptor: TEventInterceptor) {
		return Layer.effect(this, E.succeed(interceptor));
	}
}
