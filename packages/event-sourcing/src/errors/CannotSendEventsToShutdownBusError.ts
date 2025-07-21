import * as S from "effect/Schema";

export class CannotSendEventsToShutdownBusError extends S.TaggedError<CannotSendEventsToShutdownBusError>()(
	"CannotSendEventsToShutdownBusError",
	{},
) {}
