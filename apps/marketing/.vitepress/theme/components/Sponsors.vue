<script lang="ts" setup>
import { useElementVisibility } from "@vueuse/core";
import { computed, ref } from "vue";
import { useSponsors } from "../composables/sponsors";

import { cva } from "class-variance-authority";

const sponsorCss = cva([
	"flex items-center justify-center rounded-sm text-[--var(--vp-c-text-3)]\n" +
		"text-sm text-semibold bg-[--var(--vp-c-bg-soft)]",
]);

const container = ref<HTMLDivElement>();
const containerIsVisible = useElementVisibility(container);

const { sponsors } = useSponsors(containerIsVisible);

const normalSponsors = computed(() =>
	sponsors.value.filter((s) => s.rideSidebarSize === "normal"),
);
const smallSponsors = computed(() =>
	sponsors.value.filter((s) => s.rideSidebarSize === "small"),
);
</script>

<template> 
  <div ref="container" class="mt-8">
    <span class="inline-block pb-3 text-sm font-(family-name:--vp-font-family-base)
     text-(--vp-c-text-2)
     font-semibold"
          href="" target="_blank" rel="noopener">
      Partners
    </span>

    <ul class="flex flex-col gap-1">
      <li>
        <a
            v-for="sponsor in normalSponsors"
            :key="sponsor.login"
            :class="sponsorCss()"
            target="_blank"
            :href="sponsor.rideSidebarLink"
        >
          <img :src="sponsor.rightSidebarLogo" :alt="sponsor.name">
        </a>
      </li>
      <li class="
        w-full flex justify-center items-center
        text-(--vp-c-text-3)
      ">
        <a
            class="
              text-sm font-(family-name:--vp-font-family-base) font-medium
              text-center
              group
              p-0.5
              ease-linear
              active:scale-95
              cursor-pointer
              select-none
              rounded-md
              ease-linear
              duration-75
              flex justify-center items-center
              w-full
              hover:border-[var(--vp-c-gray-2)]
              rounded-md
              border-1 border-[var(--vp-c-divider)]
            "
           href="/docs/partnership.html"
        >
          <span class="
            rounded-sm
            w-full
            group-hover:bg-[var(--vp-c-gray-3)]
            group-hover:text-[var(--vp-c-text-1)]
            ease-linear
            duration-75
            bg-[var(--vp-c-bg-soft)]
            pointer-events-none
            p-4 py-5
            h-full
          ">
            Promote your product
          </span>
        </a>
      </li>
    </ul>
  </div>
</template>