import { RuntimeException, YieldableError } from "effect/Cause";
import { ExceptionLogMessageBuilder } from "../messages/ExceptionLogMessageBuilder";
import { makeExceptionMessage } from "../messages/makeExceptionMessage";
import { MethodNotImplementedException } from "./MethodNotImplementedException.js";

export abstract class ApiException extends RuntimeException {
	// readonly _tag: string = "ApiException";

	protected exceptionContext: Record<string, unknown> = {};
	protected emptyStackMessage = "Not available";

	protected errorLogMessageBuilder = makeExceptionMessage().fromException(this);

	getName() {
		return this._tag;
	}

	getStack() {
		return this.stack || this.emptyStackMessage;
	}

	getMessage() {
		return this.message;
	}

	getContext(): Record<string, unknown> {
		return this.exceptionContext;
	}

	withStack(stack: string | undefined) {
		this.stack = stack || this.emptyStackMessage;
		return this;
	}

	withContext(context: typeof this.exceptionContext) {
		this.exceptionContext = context;
		return this;
	}

	withMessage(message: string): this {
		this.message = message;
		return this;
	}

	toLogMessageData(
		messageModifier: (
			message: ExceptionLogMessageBuilder,
		) => ExceptionLogMessageBuilder = (m) => m,
	) {
		return messageModifier(this.errorLogMessageBuilder.clone()).build();
	}

	override toJSON() {
		return super.toJSON() as string;
	}

	clone(): this {
		throw new MethodNotImplementedException(this.getName(), "clone");
	}
}
