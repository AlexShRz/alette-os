import { IHeaders, validateHeaders } from "@alette/pulse";
import { RequestContextPart } from "../../../context/RequestContextPart";

export class HeaderContext extends RequestContextPart<IHeaders, {}> {
	/**
	 * 1. System can inject headers silently,
	 * for example when we add body of a certain type.
	 * 2. Unfortunately, this is difficult to represent on type
	 * level, so these headers will stay hidden in IDEs.
	 * */
	protected systemInjectedHeaders: IHeaders = {};

	constructor(headers: IHeaders = {}) {
		super(headers, {});
	}

	getSystemInjectedHeaders() {
		return this.systemInjectedHeaders;
	}

	addSystemInjectedHeaders(headers: IHeaders) {
		this.systemInjectedHeaders = { ...this.systemInjectedHeaders, ...headers };
		return this;
	}

	override getAdapter() {
		const self = this;

		return {
			setHeaders(headers: IHeaders) {
				self.state = validateHeaders(headers);
				return this;
			},
		};
	}

	override toRecord() {
		return {
			headers: {
				...this.systemInjectedHeaders,
				/**
				 * User provides headers must always override
				 * system injected ones.
				 * */
				...this.state,
			},
		};
	}

	clone() {
		const self = new HeaderContext({ ...this.state }) as this;
		self.systemInjectedHeaders = { ...this.systemInjectedHeaders };
		return self;
	}
}
