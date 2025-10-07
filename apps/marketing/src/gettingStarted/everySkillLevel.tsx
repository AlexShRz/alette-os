import { tapMount, tapUnmount } from "@alette/signal";
import { useApi } from "@alette/signal-react";
import React from "react";
import { sendEvent } from "../api/analytics";
import { getPostsForSelect } from "../api/posts";
import {
	setPostSelectedMounted,
	setPostSelectedUnmounted,
} from "./store/actions";

export const PostSelect: React.FC<{ status: "draft" | "published" }> = ({
	status,
}) => {
	const {
		isUninitialized,
		isError,
		isLoading,
		isSuccess,
		data,
		error,
		execute,
		cancel,
		unmount,
	} = useApi(
		getPostsForSelect
			.with(
				tapMount(({ context: { dispatch } }) => {
					dispatch(setPostSelectedMounted());
				}),
				tapUnmount(async ({ context: { dispatch } }) => {
					dispatch(setPostSelectedUnmounted());
					await sendEvent.execute({
						args: {
							name: "POST_SELECT_UNMOUNTED",
							context: { postStatus: status },
						},
					});
				}),
			)
			.using(() => ({
				args: status,
				skipRetry: status === "draft",
			})),
		[status],
	);

	const newStatus = status === "draft" ? "published" : "draft";

	return (
		<div>
			<button
				value={newStatus}
				onClick={(e) => {
					execute({ args: e.target.value });
				}}
			>
				{`Refetch using ${newStatus}`}
			</button>
			{/* ... */}
		</div>
	);
};
