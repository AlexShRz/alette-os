import * as S from "effect/Schema";

export class CannotShutdownEventBusListenersError extends S.TaggedError<CannotShutdownEventBusListenersError>()(
	"CannotShutdownEventBusListenersError",
	{},
) {}
