import {
	path,
	debounce,
	input,
	map,
	output,
	retry,
	retryWhen,
	runOnMount,
	wait,
} from "@alette/signal";
import { z } from "zod";
import { query } from "./base";

const Posts = z.object({ url: z.string(), name: z.string() }).loose().array();
const PostStatus = z.enum(["draft", "published"]);

export const getPosts = query(
	input(PostStatus),
	output(Posts),
	path(({ args: status, context: {/*...*/} }) => `/posts/${status}`),
	retry({
		times: 2,
		backoff: ["1 second", "5 seconds"],
		unlessStatus: [403],
	}),
);

/**
 * Create new request configuration using
 * the previous one as a foundation.
 */
export const getPostsForSelect = getPosts.with(
	debounce("300 millis"),
	runOnMount(false),
	map((posts) => posts.map(({ url, name }) => ({ url, name }))),
	retryWhen(async ({ error, attempt }, { args: status }) => {
		if (error.getStatus() === 429 && status === "draft") {
			await wait("5 seconds");
			return true;
		}

		return false;
	}),
);

const postsWithDraftStatus = await getPosts.execute({
	args: "draft",
	skipRetry: true,
});

const { cancel, when, execute, reload, unmount } = getPostsForSelect.mount();
execute({ args: "published" });

const unsubscribe = when(({ isSuccess, isError, data, error }) => {
	if (isSuccess && data) {
		console.log({ data });
		unsubscribe();
	}

	if (isError && error) {
		console.log({ error });
		unsubscribe();
		unmount();
	}
});
