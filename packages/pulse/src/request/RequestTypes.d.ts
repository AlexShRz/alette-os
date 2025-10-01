import { PendingRequest } from "./PendingRequest";
import { RequestWorkflow } from "./RequestWorkflow";

export interface IRequestMiddleware {
	(request: PendingRequest): PendingRequest;
}

export interface IRequestPipeline {
	with(m1: IRequestMiddleware): RequestWorkflow;
	with(m1: IRequestMiddleware, m2: IRequestMiddleware): RequestWorkflow;
	with(
		m1: IRequestMiddleware,
		m2: IRequestMiddleware,
		m3: IRequestMiddleware,
	): RequestWorkflow;
	with(
		m1: IRequestMiddleware,
		m2: IRequestMiddleware,
		m3: IRequestMiddleware,
		m4: IRequestMiddleware,
	): RequestWorkflow;
	with(
		m1: IRequestMiddleware,
		m2: IRequestMiddleware,
		m3: IRequestMiddleware,
		m4: IRequestMiddleware,
		m5: IRequestMiddleware,
	): RequestWorkflow;
	with(
		m1: IRequestMiddleware,
		m2: IRequestMiddleware,
		m3: IRequestMiddleware,
		m4: IRequestMiddleware,
		m5: IRequestMiddleware,
		m6: IRequestMiddleware,
	): RequestWorkflow;
	with(
		m1: IRequestMiddleware,
		m2: IRequestMiddleware,
		m3: IRequestMiddleware,
		m4: IRequestMiddleware,
		m5: IRequestMiddleware,
		m6: IRequestMiddleware,
		m7: IRequestMiddleware,
	): RequestWorkflow;
	with(
		m1: IRequestMiddleware,
		m2: IRequestMiddleware,
		m3: IRequestMiddleware,
		m4: IRequestMiddleware,
		m5: IRequestMiddleware,
		m6: IRequestMiddleware,
		m7: IRequestMiddleware,
		m8: IRequestMiddleware,
	): RequestWorkflow;
	with(
		m1: IRequestMiddleware,
		m2: IRequestMiddleware,
		m3: IRequestMiddleware,
		m4: IRequestMiddleware,
		m5: IRequestMiddleware,
		m6: IRequestMiddleware,
		m7: IRequestMiddleware,
		m8: IRequestMiddleware,
		m9: IRequestMiddleware,
	): RequestWorkflow;
	with(
		m1: IRequestMiddleware,
		m2: IRequestMiddleware,
		m3: IRequestMiddleware,
		m4: IRequestMiddleware,
		m5: IRequestMiddleware,
		m6: IRequestMiddleware,
		m7: IRequestMiddleware,
		m8: IRequestMiddleware,
		m9: IRequestMiddleware,
		m10: IRequestMiddleware,
	): RequestWorkflow;
	with(...middleware: IRequestMiddleware[]): RequestWorkflow;
}
