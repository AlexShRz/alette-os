import { YieldableError } from "effect/Cause";

export abstract class ApiError extends YieldableError {
	public readonly _tag = "ApiError" as const;
	protected customName: string = "UnknownApiError";
	protected errorContext: Record<string, unknown> = {};
	protected emptyStackMessage = "Not available";

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
