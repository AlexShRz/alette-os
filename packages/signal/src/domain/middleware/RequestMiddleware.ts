import {
	EventBusListener,
	EventBusListenerFactory,
} from "@alette/event-sourcing";
import { IAnyMiddlewareSpecification } from "@alette/pulse";
import { IRequestContext } from "../context/IRequestContext";

export class RequestMiddleware<
	Context extends IRequestContext = IRequestContext,
	Specifications extends
		IAnyMiddlewareSpecification = IAnyMiddlewareSpecification,
	Tag extends string = string,
	A extends EventBusListener = EventBusListener,
> extends EventBusListenerFactory<Tag, A> {}
