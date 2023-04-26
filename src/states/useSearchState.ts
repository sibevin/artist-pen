import { ref } from "vue";
import { createGlobalState } from "@vueuse/core";
import { SearchQuery } from "~/dwdy/types/search";
import { buildEmptySearchQuery } from "~/services/dwdy/search";

export const useSearchState = createGlobalState(() => {
  const query = ref<SearchQuery>(buildEmptySearchQuery());
  return {
    query,
  };
});
