import { useLocalStorage } from "@vueuse/core";
import type { Ref } from "vue";
import { ref, watchEffect } from "vue";

export interface JSONSponsor {
	name: string;
	login: string;
	avatar: string;
	amount: number;
	link?: string;
	org: boolean;
	rideSidebarSize: "normal" | "small" | "none";
	rideSidebarLink?: string;
	rightSidebarLogo: string;
}

type UseSponsorsStatus = "idle" | "updating" | "updated";

export function useSponsors(visible?: Ref<boolean>): {
	sponsors: Ref<JSONSponsor[]>;
	status: Ref<UseSponsorsStatus>;
} {
	const sponsors = useLocalStorage<JSONSponsor[]>("sponsors", []);
	const status = ref<UseSponsorsStatus>("idle");

	watchEffect(() => {
		if ((visible && !visible.value) || status.value !== "idle") {
			return;
		}

		status.value = "updating";
	});

	return {
		sponsors,
		status,
	};
}
