import { Routes, Route } from 'react-router-dom'
import { FilterProvider } from './FilterContext'
import Sidebar from './components/Sidebar'
import FilterBar from './components/FilterBar'
import ExecutiveSummary from './pages/SCOEffect'
import PriceRealization from './pages/TopKPIs'
import PartsDeepDive from './pages/CustomerPortfolio'
import RegionalBenchmark from './pages/MarketIntelligence'
import CrossReference from './pages/CrossReference'

export default function App() {
  return (
    <FilterProvider>
      <div className="min-h-screen">
        <Sidebar />
        <div className="ml-56">
          <FilterBar />
          <main className="p-5 pb-16">
            <Routes>
              <Route path="/" element={<ExecutiveSummary />} />
              <Route path="/price-realization" element={<PriceRealization />} />
              <Route path="/parts-deep-dive" element={<PartsDeepDive />} />
              <Route path="/regional-benchmark" element={<RegionalBenchmark />} />
              <Route path="/cross-reference" element={<CrossReference />} />
            </Routes>
          </main>
        </div>
      </div>
    </FilterProvider>
  )
}
