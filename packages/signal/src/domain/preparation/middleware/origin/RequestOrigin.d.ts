import { IRequestContext } from "../../../context/IRequestContext";

export interface IRequestOrigin<Origin extends string = string> {
	origin: Origin;
}

export type TGetRequestOrigin<C extends IRequestContext> = C["value"]["origin"];
