import * as E from "effect/Effect";
import * as Queue from "effect/Queue";
import * as Runtime from "effect/Runtime";
import { CommandTaskBuilder } from "../tasks/CommandTaskBuilder.js";
import { QueryTaskBuilder } from "../tasks/QueryTaskBuilder.js";
import { TaskBuilder } from "../tasks/TaskBuilder.js";

export interface IApiPluginMailboxMessage extends TaskBuilder<any, any> {}

export interface IApiPluginMailbox
	extends Queue.Queue<IApiPluginMailboxMessage> {}

export class PluginMailbox extends E.Service<PluginMailbox>()("PluginMailbox", {
	scoped: E.gen(function* () {
		const runtime = yield* E.runtime<never>();
		const mailbox = yield* Queue.unbounded<IApiPluginMailboxMessage>();

		yield* E.addFinalizer(() => mailbox.shutdown);

		return {
			get() {
				return mailbox;
			},

			sendQuery<A, I>(query: QueryTaskBuilder<A, I>) {
				return E.async<A, I>((resume) => {
					const task = query
						.whenSucceeded((result) => resume(E.succeed(result)))
						.whenFailed((error) => resume(E.fail(error)))
						.whenInterrupted((error) => resume(E.fail(error as I)));

					mailbox.unsafeOffer(task);
				});
			},

			sendQueryAsync<A, I>(query: QueryTaskBuilder<A, I>) {
				return Runtime.runPromise(runtime, this.sendQuery(query));
			},

			sendCommand<I>(command: CommandTaskBuilder<I>) {
				mailbox.unsafeOffer(command);
			},
		};
	}),
}) {}
