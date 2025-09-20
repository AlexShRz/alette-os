import { IRequestContext } from "../../../context/IRequestContext";

export interface IRequestPath<Path extends string = string> {
	path: Path;
}

export type TGetRequestPath<C extends IRequestContext> = C["value"]["path"];
