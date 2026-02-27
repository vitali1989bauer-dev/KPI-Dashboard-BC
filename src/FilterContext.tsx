import { createContext, useContext, useState, type ReactNode } from 'react'
import { type Filters, defaultFilters } from './data/mockData'

interface FilterContextValue {
  filters: Filters
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
}

const FilterContext = createContext<FilterContextValue>({
  filters: defaultFilters,
  setFilter: () => {},
})

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters)

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <FilterContext.Provider value={{ filters, setFilter }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  return useContext(FilterContext)
}
