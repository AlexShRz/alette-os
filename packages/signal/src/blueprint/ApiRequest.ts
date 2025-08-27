import { IAnyRequestSpecification } from "@alette/pulse";
import { IRequestContext } from "../context/IRequestContext";

export abstract class ApiRequest<
	PrevContext extends IRequestContext,
	Context extends IRequestContext,
	RequestSpec extends IAnyRequestSpecification,
> {}
