import type * as Cause from "effect/Cause";

interface IUninitializedState {
	status: "uninitialized";
}

interface ISucceededState<Value> {
	status: "succeeded";
	value: Value;
}

interface IFailedState<ErrorType> {
	status: "failed";
	error: ErrorType;
}

interface IInterruptedState {
	status: "interrupted";
	error: Cause.InterruptedException;
}

export type IRunnableState<Value, Errors> =
	| IUninitializedState
	| ISucceededState<Value>
	| IFailedState<Errors>
	| IInterruptedState;
