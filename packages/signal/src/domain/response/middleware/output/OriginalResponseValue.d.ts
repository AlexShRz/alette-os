import { IRequestContext } from "../../../context/IRequestContext";

export interface IOriginalRequestResponseValue<Response = unknown> {
	resultType: Response;
	originalResultType: Response;
}

export type TGetOriginalRequestResponseValue<C extends IRequestContext> =
	C["types"]["originalResultType"];
