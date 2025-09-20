import { THttpBody } from "@alette/pulse";
import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { RequestSessionContext } from "../../../../execution/services/RequestSessionContext";
import { BodyContext } from "../../../context/body/BodyContext";
import { HeaderContext } from "../../../context/headers/HeaderContext";

export class BodyUpdateOperationArgs extends Context.Tag(
	"BodyUpdateOperationArgs",
)<
	BodyUpdateOperationArgs,
	{
		requestContext: RequestSessionContext;
		body: THttpBody;
		bodyContext: BodyContext;
		headerContext: SynchronizedRef.SynchronizedRef<HeaderContext>;
	}
>() {
	static make(args: BodyUpdateOperationArgs["Type"]) {
		return Layer.effect(this, E.succeed(args));
	}
}
