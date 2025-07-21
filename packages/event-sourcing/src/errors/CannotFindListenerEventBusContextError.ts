import * as S from "effect/Schema";

export class CannotFindListenerEventBusContextError extends S.TaggedError<CannotFindListenerEventBusContextError>()(
	"CannotFindListenerEventBusContextError",
	{
		listener: S.String,
	},
) {}
