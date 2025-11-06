import { IRequestContext } from "../domain";
import { OneShotRequest } from "./oneShotRequest/OneShotRequest";

export type TAnyApiRequest<Context extends IRequestContext> =
	| OneShotRequest<Context, any>
	| Omit<OneShotRequest<Context, any>, "with" | "toFactory">;
