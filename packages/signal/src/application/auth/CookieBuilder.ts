import { ISchema, as } from "@alette/pulse";
import { v4 as uuid } from "uuid";
import { ICookieSupplier } from "../../domain/auth/cookies/CookieTypes";
import { TRecognizedApiDuration } from "../../shared";
import { PluginTaskScheduler } from "../plugins/PluginTaskScheduler";
import { Cookie } from "./Cookie";

export class CookieBuilder<Credentials = unknown> {
	protected id = uuid();
	protected cookieSupplier: ICookieSupplier<Credentials> | null = null;
	protected credentialSchema = as<Credentials>();
	protected refreshInterval: TRecognizedApiDuration | null = null;

	constructor(protected scheduler: PluginTaskScheduler) {}

	credentials<NewCredentials>(schema: ISchema<unknown, NewCredentials>) {
		const self = this as unknown as CookieBuilder<NewCredentials>;
		self.credentialSchema = schema;
		return self;
	}

	from(cookieSupplier: ICookieSupplier<Credentials>) {
		this.cookieSupplier = cookieSupplier;
		return this;
	}

	refreshEvery(interval: TRecognizedApiDuration) {
		this.refreshInterval = interval;
		return this;
	}

	protected assertConfigured(): asserts this is {
		cookieSupplier: ICookieSupplier<Credentials>;
	} {
		if (!this.cookieSupplier) {
			throw new Error('[CookieBuilder] - "from" cookie provider was not set.');
		}
	}

	build() {
		this.assertConfigured();
		return new Cookie<Credentials>(this.scheduler, {
			id: this.id,
			cookieSupplier: this.cookieSupplier,
			credentialSchema: this.credentialSchema,
			refreshInterval: this.refreshInterval,
		});
	}
}
