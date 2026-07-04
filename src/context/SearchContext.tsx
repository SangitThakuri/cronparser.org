import { createContext, useContext } from "react"

interface SearchContextValue {
  query: string
  setQuery: (query: string) => void
}

export const SearchContext = createContext<SearchContextValue>({
  query: "",
  setQuery: () => {},
})

export function useSearchQuery() {
  return useContext(SearchContext)
}
