import { RequestInterruptedError } from "@alette/pulse";
import { IRequestContext } from "../../context";
import {
	TRequestError,
	TRequestResponse,
	TRequestSettings,
} from "../../context/typeUtils/RequestIOTypes";
import { ResponseRef } from "../../response/adapter/ResponseRef";

export namespace IOneShotRequestState {
	type Any<C extends IRequestContext = IRequestContext> = {
		isLoading: boolean;
		isUninitialized: boolean;
		isSuccess: boolean;
		isError: boolean;
		data: ResponseRef<TRequestResponse<C>> | null;
		error: TRequestError<C> | null;
		settings: TRequestSettings<C> | null;
	};

	type AnyUnwrapped<C extends IRequestContext = IRequestContext> = {
		isLoading: boolean;
		isUninitialized: boolean;
		isSuccess: boolean;
		isError: boolean;
		/**
		 * Unwrapped must not contain response refs
		 * */
		data: TRequestResponse<C> | null;
		error: TRequestError<C> | null;
		settings: TRequestSettings<C> | null;
	};

	interface Default {
		isLoading: false;
		isUninitialized: false;
		isSuccess: false;
		isError: false;
		data: null;
		error: null;
		settings: null;
	}

	interface Uninitialized extends Any {
		isUninitialized: true;
	}

	interface Loading extends Any {
		isLoading: true;
	}

	interface Success<C extends IRequestContext = IRequestContext>
		extends Any<C> {
		isSuccess: true;
		data: ResponseRef<TRequestResponse<C>>;
		settings: TRequestSettings<C>;
	}

	interface Failure<C extends IRequestContext = IRequestContext>
		extends Any<C> {
		isError: true;
		error: TRequestError<C>;
		settings: TRequestSettings<C>;
	}

	interface Cancelled extends Any {}

	interface Interrupted extends Any {
		isError: true;
		error: RequestInterruptedError;
	}
}
