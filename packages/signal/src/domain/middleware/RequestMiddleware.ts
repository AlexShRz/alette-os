import {
	EventBusListener,
	EventBusListenerFactory,
} from "@alette/event-sourcing";
import { IRequestContext } from "../context/IRequestContext";
import { IAnyMiddlewareSpecification } from "../specification";

export class RequestMiddleware<
	out Context extends IRequestContext = IRequestContext,
	Specifications extends
		IAnyMiddlewareSpecification = IAnyMiddlewareSpecification,
	Tag extends string = string,
	A extends EventBusListener = EventBusListener,
> extends EventBusListenerFactory<Tag, A> {}
