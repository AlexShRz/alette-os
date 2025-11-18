import { tap, tapMount, tapUnmount } from "@alette/signal";
import React from "react";
import { useApi } from "../../useApi";
import { getData2 } from "./getData";

export interface IComponentProps {
	onNewDataSelect?: (data: string) => void;
	onRequestMount?: () => void;
	onRequestSuccess?: () => void;
	onRequestUnmount?: () => void;
}

export const TestComponent2: React.FC<IComponentProps> = ({
	onRequestMount,
	onRequestUnmount,
	onRequestSuccess,
}) => {
	const {
		isError,
		isLoading,
		isSuccess,
		data,
		error,
		execute,
		cancel,
		unmount,
	} = useApi(
		getData2.with(
			tap(() => {
				onRequestSuccess && onRequestSuccess();
			}),
			tapMount(() => {
				onRequestMount && onRequestMount();
			}),
			tapUnmount(() => {
				onRequestUnmount && onRequestUnmount();
			}),
		),
	);

	return (
		<div>
			<button data-testid="unmount" onClick={() => unmount()}>
				Unmount
			</button>
			{isSuccess && <p data-testid="succeeded">Succeeded</p>}
			{isError && <p data-testid="failed">Failed</p>}
			{error && <p data-testid="error">{error.toString()}</p>}
			{isLoading && (
				<div>
					<p data-testid="loading">Loading</p>
					<button data-testid="cancel" onClick={() => cancel()}>
						Cancel
					</button>
				</div>
			)}
			{data && <div data-testid="data">{data}</div>}
			<button
				data-testid="execute"
				onClick={() => {
					execute();
				}}
			>
				Execute
			</button>
		</div>
	);
};
