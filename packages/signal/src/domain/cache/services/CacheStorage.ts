import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as LayerMap from "effect/LayerMap";
import * as RcMap from "effect/RcMap";
import { v4 as uuid } from "uuid";
import { GlobalContext } from "../context/services/GlobalContext";
import { RequestThread } from "./RequestThread";

export class CacheStorage extends E.Service<CacheStorage>()("CacheStorage", {
	scoped: E.gen(function* () {
		return {};
	}),
}) {}
