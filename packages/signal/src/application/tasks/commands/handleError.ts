import * as E from "effect/Effect";
import {
	ErrorHandler,
	THandleableError,
} from "../../../domain/errors/ErrorHandler";
import { task } from "../../plugins/tasks/primitive/functions";

export const handleError = (error: THandleableError) =>
	task(
		E.gen(function* () {
			const errors = yield* E.serviceOptional(ErrorHandler);
			yield* errors.handle(error);
		}),
	);
