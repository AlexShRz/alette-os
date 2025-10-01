import { IRequestContext } from "../../context/IRequestContext";
import { method } from "./method";

export const puts = <C extends IRequestContext>() => method<C, "PUT">("PUT");
