import * as E from "effect/Effect";
import {
	ErrorHandler,
	TReportableError,
} from "../../domain/errors/ErrorHandler";
import { task } from "../plugins/tasks/primitive/functions";

export const handleError = (error: TReportableError) =>
	task(
		E.gen(function* () {
			const errors = yield* E.serviceOptional(ErrorHandler);
			yield* errors.handle(error);
		}),
	);
