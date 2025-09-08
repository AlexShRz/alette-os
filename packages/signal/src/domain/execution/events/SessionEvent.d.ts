import { RequestSessionEvent } from "./RequestSessionEvent";
import { SessionEventEnvelope } from "./SessionEventEnvelope";

export type TSessionEvent = RequestSessionEvent | SessionEventEnvelope;

export interface IRequestSessionEvent {
	hasRequestId(): boolean;

	setRequestId(id: string): this;
}
