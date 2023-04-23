import { ref } from "vue";
import { createGlobalState } from "@vueuse/core";
import { SearchQuery } from "~/dwdy/types/search";
import { EMPTY_SEARCH_QUERY } from "~/services/dwdy/search";

export const useSearchState = createGlobalState(() => {
  const query = ref<SearchQuery>(Object.assign({}, EMPTY_SEARCH_QUERY));
  return {
    query,
  };
});
