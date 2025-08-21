import { MiddlewareConstraint } from "./MiddlewareConstraint";
import { RequestConstraint } from "./RequestConstraint";

export const requestConstraint = RequestConstraint.from;

export const middlewareConstraint = MiddlewareConstraint.from;
