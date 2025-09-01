import { EventBusListenerFactory } from "@alette/event-sourcing";
import { IAnyMiddlewareSpecification } from "@alette/pulse";
import { IRequestContext } from "../context/IRequestContext";

export class RequestMiddleware<
	Context extends IRequestContext = IRequestContext,
	Specifications extends
		IAnyMiddlewareSpecification = IAnyMiddlewareSpecification,
> extends EventBusListenerFactory {}
