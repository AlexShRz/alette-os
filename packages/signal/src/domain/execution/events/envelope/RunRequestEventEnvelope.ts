import { TMaybeWrappedEvent } from "@alette/event-sourcing";
import { SessionEventEnvelope } from "../SessionEventEnvelope";
import { RunRequest } from "../request/RunRequest";

export abstract class RunRequestEventEnvelope extends SessionEventEnvelope<RunRequest> {
	constructor(event: TMaybeWrappedEvent<RunRequest>) {
		super({
			isWrapped: (event: unknown) => event instanceof RunRequest,
			wrapped: event,
		});
	}
}
