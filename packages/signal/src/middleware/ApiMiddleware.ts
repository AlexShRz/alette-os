import { EventBusListenerFactory } from "@alette/event-sourcing";
import { IAnyMiddlewareSpecification } from "@alette/pulse";
import { IRequestContext } from "../context/IRequestContext";

export class ApiMiddleware<
	Context extends IRequestContext,
	Specifications extends IAnyMiddlewareSpecification,
> extends EventBusListenerFactory {}
