import React from "react";
import { useApi } from "../useApi";
import { getData } from "./getData";

export interface IComponentProps {
	provided: string;
}

export const TestComponent: React.FC<IComponentProps> = ({ provided }) => {
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
	} = useApi(() => getData.using(() => ({ args: provided })));

	if (isUninitialized) {
		return <p>Uninitialized</p>;
	}

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
			<button data-testid="execute" onClick={() => execute()}>
				Execute
			</button>
		</div>
	);
};
