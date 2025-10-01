import { THttpStatusCode } from "../../THttpStatusCode";
import { IHeaders } from "../../headers";
import { ApiError } from "./ApiError";

export interface IRequestErrorProps {
	/**
	 * 1. Custom set reason for request failure.
	 * 2. Can be "network error", etc.
	 * */
	reason: string;
	/**
	 * 1. Can be null if DNS resolution fails, no internet, connection refused, CORS blocked, etc.
	 * 2. Status can be "0" on CORS error for example, etc.
	 * */
	status: THttpStatusCode | 0 | null;
	/**
	 * Can also be null, see above.
	 * */
	headers: IHeaders | null;
	/**
	 * What was sent back by the server,
	 * can be literally anything.
	 * */
	serverResponse: unknown;
}

export class RequestFailedError extends ApiError {
	protected props: IRequestErrorProps = {
		reason: "Not provided",
		serverResponse: null,
		status: null,
		headers: null,
	};

	constructor(passedProps: Partial<IRequestErrorProps> = {}) {
		super("RequestFailedError");
		this.props = {
			...this.props,
			...passedProps,
		};
	}

	getReason() {
		return this.props.reason;
	}

	getStatus() {
		return this.props.status;
	}

	getHeaders() {
		return this.props.headers;
	}

	getServerResponse() {
		return this.props.serverResponse;
	}

	cloneSelf() {
		return new RequestFailedError(this.props);
	}
}
