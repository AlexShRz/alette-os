import { ApiExceptionInstance } from "@alette/pulse";
import * as E from "effect/Effect";
import type { Ctor } from "effect/Types";

type ErrorBlueprint = Ctor<ApiExceptionInstance>;

export class RequestRecognizedErrors extends E.Service<RequestRecognizedErrors>()(
	"RequestRecognizedErrors",
	{
		scoped: E.gen(function* () {
			const recognizedErrors = new Set<ErrorBlueprint>();

			return {
				isRecognizedError(error: unknown) {
					return [...recognizedErrors.keys()].some(
						(errorBlueprint) => error instanceof errorBlueprint,
					);
				},
				addRecognizedErrors(blueprints: ErrorBlueprint[]) {
					blueprints.forEach((e) => {
						recognizedErrors.add(e);
					});
				},
			};
		}),
	},
) {}
