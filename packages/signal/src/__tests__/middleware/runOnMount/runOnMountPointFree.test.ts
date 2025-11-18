import { as, factory, input, runOnMount } from "../../../domain";
import { createTestApi } from "../../utils";

test("it starts requests automatically in point-free mode", async () => {
	const { custom } = createTestApi();
	const value = "asdasdaasd";

	const getData = custom(
		input(as<string>()),
		runOnMount,
		factory(() => {
			return value;
		}),
	);

	const { getState } = getData.mount();

	await vi.waitFor(() => {
		expect(getState().data).toEqual(value);
	});
});
