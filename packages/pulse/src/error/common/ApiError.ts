import { YieldableError } from "effect/Cause";
import { ErrorLogMessageBuilder } from "../messages/ErrorLogMessageBuilder";
import { makeErrorMessage } from "../messages/makeErrorMessage";

export abstract class ApiError extends YieldableError {
	public readonly _tag = "ApiError" as const;
	protected customName: string = "UnknownApiError";
	protected errorContext: Record<string, unknown> = {};
	protected emptyStackMessage = "Not available";

	protected errorLogMessageBuilder = makeErrorMessage().fromError(this);

	getName() {
		return this.customName;
	}

	getStack() {
		return this.stack || this.emptyStackMessage;
	}

	getMessage() {
		return this.message;
	}

	getContext(): Record<string, unknown> {
		return this.errorContext;
	}

	withStack(stack: string | undefined) {
		this.stack = stack || this.emptyStackMessage;
		return this;
	}

	withContext(context: typeof this.errorContext) {
		this.errorContext = context;
		return this;
	}

	withMessage(message: string): this {
		this.message = message;
		return this;
	}

	toLogMessageData(
		messageModifier: (
			message: ErrorLogMessageBuilder,
		) => ErrorLogMessageBuilder = (m) => m,
	) {
		return messageModifier(this.errorLogMessageBuilder.clone()).build();
	}

	override toJSON() {
		return super.toJSON() as string;
	}

	protected abstract cloneSelf(): object;

	clone() {
		const self = this.cloneSelf() as this;
		self.stack = this.getStack();
		self.message = this.getMessage();
		self.errorContext = { ...this.getContext() };
		self.name = this.getName();
		return self;
	}
}
