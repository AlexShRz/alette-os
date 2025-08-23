import { Chunk, Effect as E, Queue, Stream } from "effect";

export const getStreamEffect = (queue: Queue.Queue<number>) =>
	E.gen(function* () {
		return yield* Stream.fromQueue(queue).pipe(
			Stream.take(1),
			Stream.runCollect,
			E.andThen((c) => Chunk.unsafeGet(c, 0)),
		);
	});
