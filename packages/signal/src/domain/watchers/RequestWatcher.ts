import { Listener } from "@alette/event-sourcing";
import { IAnyMiddlewareSpecification } from "@alette/pulse";
import { IRequestContext } from "../context/IRequestContext";

export class RequestWatcher<
	Context extends IRequestContext = IRequestContext,
	Specifications extends
		IAnyMiddlewareSpecification = IAnyMiddlewareSpecification,
> extends Listener {}
