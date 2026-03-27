import { Routes, Route } from 'react-router-dom'
import { FilterProvider } from './FilterContext'
import Sidebar from './components/Sidebar'
import FilterBar from './components/FilterBar'
import Overview from './pages/TopKPIs'
import PriceWaterfall from './pages/SCOEffect'
import PartsDeepDive from './pages/CustomerPortfolio'
import RegionalBenchmark from './pages/MarketIntelligence'
import Trends from './pages/Operations'

export default function App() {
  return (
    <FilterProvider>
      <div className="min-h-screen">
        <Sidebar />
        <div className="ml-56">
          <FilterBar />
          <main className="p-6 pb-20">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/price-waterfall" element={<PriceWaterfall />} />
              <Route path="/parts-deep-dive" element={<PartsDeepDive />} />
              <Route path="/regional-benchmark" element={<RegionalBenchmark />} />
              <Route path="/trends" element={<Trends />} />
            </Routes>
          </main>
        </div>
      </div>
    </FilterProvider>
  )
}
