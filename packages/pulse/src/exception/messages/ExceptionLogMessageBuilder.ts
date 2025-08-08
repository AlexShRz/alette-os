import { AbstractBuilder } from "../../utils/AbstractBuilder.js";
import { ApiException } from "../common/ApiException.js";

export class ExceptionLogMessageBuilder extends AbstractBuilder<ExceptionLogMessageBuilder> {
	protected shouldDisplayContext = true;
	protected shouldDisplayStack = true;
	protected name = "";
	protected stack = "";
	protected lines: string[] = [];
	protected exceptionContext: Record<string, unknown> = {};

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

	setContext(context: typeof this.exceptionContext) {
		this.exceptionContext = context;
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

	static fromException(exception: ApiException) {
		return new ExceptionLogMessageBuilder()
			.setName(exception.getName())
			.setStack(exception.getStack())
			.addNewLineMessage(exception.getMessage())
			.setContext(exception.getContext());
	}

	clone() {
		return this.cloneWith((self) => {
			self.shouldDisplayContext = this.shouldDisplayContext;
			self.shouldDisplayStack = this.shouldDisplayContext;
			self.name = this.name;
			self.stack = this.stack;
			self.lines = [...this.lines];
			self.exceptionContext = { ...this.exceptionContext };
			return self;
		});
	}

	protected buildContext(): Record<string, unknown> {
		if (!this.shouldDisplayContext) {
			return { context: "Hidden" };
		}

		return { context: this.exceptionContext };
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
