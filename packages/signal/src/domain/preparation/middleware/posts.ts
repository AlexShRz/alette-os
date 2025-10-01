import { IRequestContext } from "../../context/IRequestContext";
import { method } from "./method";

export const posts = <C extends IRequestContext>() => method<C, "POST">("POST");
