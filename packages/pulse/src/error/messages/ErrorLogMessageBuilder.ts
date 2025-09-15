import { AbstractBuilder } from "../../utils/AbstractBuilder.js";
import { ApiErrorInstance } from "../common/ApiErrorInstance";

export class ErrorLogMessageBuilder extends AbstractBuilder<ErrorLogMessageBuilder> {
	protected shouldDisplayContext = true;
	protected shouldDisplayStack = true;
	protected name = "";
	protected stack = "";
	protected lines: string[] = [];
	protected errorContext: Record<string, unknown> = {};

	setName(name: string) {
		this.name = name;
		return this;
	}

	addNewLineMessage(newLine: string) {
		this.lines.push(newLine);
		return this;
	}

	setStack(stack: string) {
		this.stack = stack;
		return this;
	}

	setContext(context: typeof this.errorContext) {
		this.errorContext = context;
		return this;
	}

	hideStack() {
		this.shouldDisplayStack = false;
		return this;
	}

	showStack() {
		this.shouldDisplayStack = true;
		return this;
	}

	hideContext() {
		this.shouldDisplayContext = false;
		return this;
	}

	showContext() {
		this.shouldDisplayContext = true;
		return this;
	}

	fromError(error: ApiErrorInstance) {
		return new ErrorLogMessageBuilder()
			.setName(error.getName())
			.setStack(error.getStack())
			.addNewLineMessage(error.getMessage())
			.setContext(error.getContext());
	}

	clone() {
		return this.cloneWith((self) => {
			self.shouldDisplayContext = this.shouldDisplayContext;
			self.shouldDisplayStack = this.shouldDisplayContext;
			self.name = this.name;
			self.stack = this.stack;
			self.lines = [...this.lines];
			self.errorContext = { ...this.errorContext };
			return self;
		});
	}

	protected buildContext(): Record<string, unknown> {
		if (!this.shouldDisplayContext) {
			return { context: "Hidden" };
		}

		return { context: this.errorContext };
	}

	protected buildErrorName() {
		if (!this.name) {
			return '"Unknown Error"';
		}

		return `"${this.name}"`;
	}

	protected buildErrorStack() {
		const prefix = `Stack:`;

		if (!this.stack) {
			return `${prefix} "The stack is empty."`;
		}

		if (!this.shouldDisplayStack) {
			return `${prefix} "Hidden"`;
		}

		return `${prefix} "${this.stack}"`;
	}

	protected buildMessages() {
		const prefix = `Message:`;

		if (!this.lines.length) {
			return `${prefix} "No message was provided."`;
		}

		return `${prefix} "${this.lines.join("\n")}"`;
	}

	override toString() {
		const [message, context] = this.build();
		return `${message}\nContext: "${JSON.stringify(context)}"`;
	}

	/**
	 * Builds an array of relevant things that
	 * can be put into console.log(...)
	 * */
	build() {
		return [
			[
				`ERROR <${this.buildErrorName()}>`,
				this.buildMessages(),
				this.buildErrorStack(),
			].join("\n"),
			this.buildContext(),
		] as [message: string, context: Record<string, unknown>];
	}
}
