import { setErrorHandler, setLoggerConfig } from "../../application";
import {
	RefreshTokenTypeValidationError,
	TokenTypeValidationError,
} from "../../domain";
import { createTestApi } from "../utils";

test.each([[124123124124], [undefined], [null]])(
	"it throws a fatal error if a non string token value is returned",
	async (invalidToken) => {
		const { api, token } = createTestApi();
		let failed = false;

		api.tell(
			setLoggerConfig((logger) => logger.mute()),
			setErrorHandler((error) => {
				if (
					error instanceof TokenTypeValidationError &&
					error.getInvalidToken() === invalidToken
				) {
					failed = true;
				}
			}),
		);

		const myToken = token()
			// @ts-expect-error
			.from(() => invalidToken)
			.build();

		myToken.refresh();
		await vi.waitFor(() => {
			expect(failed).toBeTruthy();
		});
	},
);

test.each([[124123124124], [undefined], [null]])(
	"it throws a fatal error if a non string refresh token value is returned",
	async (invalidRefreshToken) => {
		const { api, token } = createTestApi();
		let failed = false;

		api.tell(
			setLoggerConfig((logger) => logger.mute()),
			setErrorHandler((error) => {
				if (
					error instanceof RefreshTokenTypeValidationError &&
					error.getInvalidRefreshToken() === invalidRefreshToken
				) {
					failed = true;
				}
			}),
		);

		const myToken = token()
			.from(() => ({
				token: "my-token",
				// @ts-expect-error
				refreshToken: invalidRefreshToken,
			}))
			.build();

		myToken.refresh();
		await vi.waitFor(() => {
			expect(failed).toBeTruthy();
		});
	},
);
