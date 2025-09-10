import { RequestInterruptedException } from "../../../shared/exception/RequestInterruptedException";
import { IRequestContext } from "../../context/IRequestContext";
import {
	TRequestError,
	TRequestResponse,
} from "../../context/typeUtils/RequestIOTypes";
import { ResponseRef } from "../../response/adapter/ResponseRef";

/**
 * 1. "Stale-while-revalidate" type variations are not represented in the type itself.
 * */
export namespace IOneShotRequestState {
	type Any<C extends IRequestContext = IRequestContext> = {
		isLoading: boolean;
		isUninitialized: boolean;
		isSuccess: boolean;
		isError: boolean;
		data: ResponseRef<TRequestResponse<C>> | null;
		error: TRequestError<C> | RequestInterruptedException | null;
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
		error: TRequestError<C> | RequestInterruptedException | null;
	};

	interface Default {
		isLoading: false;
		isUninitialized: false;
		isSuccess: false;
		isError: false;
		data: null;
		error: null;
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
	}

	interface Failure<C extends IRequestContext = IRequestContext>
		extends Any<C> {
		isError: true;
		error: TRequestError<C>;
	}

	interface Cancelled extends Any {}

	interface Interrupted extends Any {
		isError: true;
		error: RequestInterruptedException;
	}
}
