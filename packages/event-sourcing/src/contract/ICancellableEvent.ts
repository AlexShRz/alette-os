export interface ICancellableEvent {
	isCancelled(): boolean;

	cancel(): this;
}
