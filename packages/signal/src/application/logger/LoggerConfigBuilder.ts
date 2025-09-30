import { ISystemLoggerConfig } from "../../domain/logger/SystemLogger";
import { isTestEnv } from "../../shared/utils/isTestEnv";

export class LoggerConfigBuilder {
	protected config: ISystemLoggerConfig = {
		logError: false,
		logInfo: false,
		logDebug: false,
		logFatal: !isTestEnv(),
	};

	mute() {
		this.config = {
			logError: false,
			logInfo: false,
			logDebug: false,
			logFatal: false,
		};
		return this;
	}

	unmute() {
		this.config = {
			logError: true,
			logInfo: true,
			logDebug: true,
			logFatal: true,
		};
		return this;
	}

	muteInfo() {
		this.config = {
			...this.config,
			logInfo: false,
		};
		return this;
	}

	unmuteInfo() {
		this.config = {
			...this.config,
			logInfo: true,
		};
		return this;
	}

	muteDebug() {
		this.config = {
			...this.config,
			logDebug: false,
		};
		return this;
	}

	unmuteDebug() {
		this.config = {
			...this.config,
			logDebug: true,
		};
		return this;
	}

	muteError() {
		this.config = {
			...this.config,
			logError: false,
		};
		return this;
	}

	unmuteError() {
		this.config = {
			...this.config,
			logError: true,
		};
		return this;
	}

	muteFatal() {
		this.config = {
			...this.config,
			logFatal: false,
		};
		return this;
	}

	unmuteFatal() {
		this.config = {
			...this.config,
			logFatal: true,
		};
		return this;
	}

	build() {
		return this.config;
	}
}
