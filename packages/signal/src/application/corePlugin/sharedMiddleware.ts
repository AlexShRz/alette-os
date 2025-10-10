import { RequestFailedError } from "@alette/pulse";
import type { Ctor } from "effect/Types";
import { throws } from "../../domain";
import { IRequestContext } from "../../domain/context/IRequestContext";

export const withRecognizedErrors = <C extends IRequestContext>() =>
	throws<C, [Ctor<RequestFailedError>]>(RequestFailedError);
