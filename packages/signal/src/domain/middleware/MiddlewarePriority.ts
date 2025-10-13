export enum MiddlewarePriority {
	OutOfBounds,
	RateLimit,
	BeforeCreation,
	Interception,
	Creation,
	BeforeExecution,
	Execution,
	Mapping,
}
