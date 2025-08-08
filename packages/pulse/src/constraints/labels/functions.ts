import { MiddlewareLabel } from "./MiddlewareLabel";
import { RequestLabel } from "./RequestLabel";

export const label = RequestLabel.toFactory;

export const middlewareLabel = MiddlewareLabel.toFactory;
