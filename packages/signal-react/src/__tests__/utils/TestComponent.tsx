import { tap, tapMount, tapUnmount } from "@alette/signal";
import React from "react";
import { useApi } from "../../useApi";
import { getData } from "./getData";

export interface IComponentProps {
	provided: string;
	possibleData?: string[];
	onNewDataSelect?: (data: string) => void;
	onRequestMount?: () => void;
	onRequestSuccess?: () => void;
	onRequestUnmount?: () => void;
}

export const TestComponent: React.FC<IComponentProps> = ({
	provided,
	possibleData,
	onNewDataSelect,
	onRequestMount,
	onRequestUnmount,
	onRequestSuccess,
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
		getData
			.with(
				tap(() => {
					onRequestSuccess && onRequestSuccess();
				}),
				tapMount(() => {
					onRequestMount && onRequestMount();
				}),
				tapUnmount(() => {
					onRequestUnmount && onRequestUnmount();
				}),
			)
			.using(() => ({ args: provided })),
	);

	if (isUninitialized) {
		return <p data-testid="uninitialized">Uninitialized</p>;
	}

	return (
		<div>
			<div data-testid="provided-data">{provided}</div>
			{(possibleData || []).map((data, i) => {
				return (
					<button
						key={`${data}-${i}`}
						data-testid={`to-${data}`}
						onClick={() => {
							onNewDataSelect && onNewDataSelect(data);
						}}
					>
						Switch to new data
					</button>
				);
			})}
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
			<button data-testid="reload">Execute</button>
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
