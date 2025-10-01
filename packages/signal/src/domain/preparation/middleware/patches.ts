import { IRequestContext } from "../../context/IRequestContext";
import { method } from "./method";

export const patches = <C extends IRequestContext>() =>
	method<C, "PATCH">("PATCH");
