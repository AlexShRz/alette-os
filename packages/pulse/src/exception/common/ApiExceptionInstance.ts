import { YieldableError } from "effect/Cause";
import { ExceptionLogMessageBuilder } from "../messages/ExceptionLogMessageBuilder";
import { makeExceptionMessage } from "../messages/makeExceptionMessage";

export abstract class ApiExceptionInstance extends YieldableError {
	public readonly _tag = "ApiException" as const;
	protected customName: string = "UnknownApiException";
	protected exceptionContext: Record<string, unknown> = {};
	protected emptyStackMessage = "Not available";

	protected errorLogMessageBuilder = makeExceptionMessage().fromException(this);

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

	protected abstract cloneSelf(): object;

	clone() {
		const self = this.cloneSelf() as this;
		self.stack = this.getStack();
		self.message = this.getMessage();
		self.exceptionContext = { ...this.getContext() };
		self.name = this.getName();
		return self;
	}
}
