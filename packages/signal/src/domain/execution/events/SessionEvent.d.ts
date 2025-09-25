import { RequestSessionEvent } from "./RequestSessionEvent";
import { SessionEventEnvelope } from "./SessionEventEnvelope";

export type TSessionEvent = RequestSessionEvent | SessionEventEnvelope;

export interface IRequestSessionEvent {
	getRequestId(): string;

	hasRequestId(): boolean;

	setRequestId(id: string): this;
}
