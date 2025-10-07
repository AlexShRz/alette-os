import { IRequestContext } from "../domain";
import { OneShotRequest } from "./oneShotRequest/OneShotRequest";

export type TAnyApiRequest<Context extends IRequestContext> =
	| OneShotRequest<any, Context>
	| Omit<OneShotRequest<any, Context>, "with" | "toFactory">;
