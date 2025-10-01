import { IRequestContext } from "../../context/IRequestContext";
import { method } from "./method";

export const deletes = <C extends IRequestContext>() =>
	method<C, "DELETE">("DELETE");
