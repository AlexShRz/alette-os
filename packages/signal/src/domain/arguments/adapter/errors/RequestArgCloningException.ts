import { ApiException } from "@alette/pulse";

export class RequestArgCloningException extends ApiException.AsFatal(
	"RequestArgCloningException",
) {
	constructor(args: unknown) {
		super(
			"Cannot clone request arguments.\n" +
				"Make sure that argument contain only serializable values," +
				"or create a custom argumentAdapter.\n" +
				`Passed arguments - "${args}"`,
		);
	}
}
