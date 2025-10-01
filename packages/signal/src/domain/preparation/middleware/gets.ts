import { IRequestContext } from "../../context/IRequestContext";
import { method } from "./method";

export const gets = <C extends IRequestContext>() => method<C, "GET">("GET");
