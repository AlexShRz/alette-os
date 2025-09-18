import * as E from "effect/Effect";
import {
	ErrorHandler,
	IErrorHandlerFn,
} from "../../domain/errors/ErrorHandler";
import { task } from "../plugins/tasks/primitive/functions";

export const setErrorHandler = (reporter: IErrorHandlerFn) =>
	task(
		E.gen(function* () {
			const errors = yield* E.serviceOptional(ErrorHandler);
			errors.setHandler(reporter);
		}),
	);
