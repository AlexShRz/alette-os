import * as E from "effect/Effect";
import * as Option from "effect/Option";
import * as Queue from "effect/Queue";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Runnable } from "../runnable/Runnable";

export interface IScheduledTask extends Runnable<any, any> {}

export class TaskScheduler extends E.Service<TaskScheduler>()("TaskScheduler", {
	effect: E.gen(function* () {
		const highPriorityTasks = yield* Queue.unbounded<IScheduledTask>();
		const lowPriorityTasks = yield* Queue.unbounded<IScheduledTask>();

		/**
		 * Pull tasks from queues prioritizing
		 * the "high priority tasks" queue.
		 * */
		const takeFromQueues = Stream.repeatEffectWithSchedule(
			E.gen(function* () {
				const highPriorityTask = yield* Queue.poll(highPriorityTasks);

				if (Option.isSome(highPriorityTask)) {
					return highPriorityTask.value;
				}

				const lowPriorityTask = yield* Queue.poll(lowPriorityTasks);

				if (Option.isSome(lowPriorityTask)) {
					return lowPriorityTask.value;
				}

				return null;
			}),
			/**
			 * DO NOT REMOVE THIS, otherwise js event loop
			 * will be constantly blocked and our app will slow down
			 * (from instant -> 3-4 seconds minimum)
			 * */
			Schedule.fixed("10 millis"),
		).pipe(Stream.filter((value) => value !== null));

		return {
			scheduleHighPriority(task: IScheduledTask) {
				return E.gen(function* () {
					yield* highPriorityTasks.offer(task);
					return task;
				});
			},

			scheduleLowPriority(task: IScheduledTask) {
				return E.gen(function* () {
					yield* lowPriorityTasks.offer(task);
					return task;
				});
			},

			take() {
				return takeFromQueues;
			},
		};
	}),
}) {}
