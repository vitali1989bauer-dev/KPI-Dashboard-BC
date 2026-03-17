import { Routes, Route } from 'react-router-dom'
import { FilterProvider } from './FilterContext'
import Sidebar from './components/Sidebar'
import FilterBar from './components/FilterBar'
import TopKPIs from './pages/TopKPIs'
import SCOEffect from './pages/SCOEffect'
import MarketIntelligence from './pages/MarketIntelligence'
import CustomerPortfolio from './pages/CustomerPortfolio'
import PricingConditions from './pages/PricingConditions'
import Operations from './pages/Operations'
import PricingDeepDive from './pages/PricingDeepDive'
import CostDeepDive from './pages/CostDeepDive'
import DataConnections from './pages/DataConnections'
import PriceEngine from './pages/PriceEngine'
import ImplementationFAQ from './pages/ImplementationFAQ'

export default function App() {
  return (
    <FilterProvider>
      <div className="min-h-screen">
        <Sidebar />
        <div className="ml-64">
          <FilterBar />
          <main className="p-6">
            <Routes>
              <Route path="/" element={<TopKPIs />} />
              <Route path="/sco-effect" element={<SCOEffect />} />
              <Route path="/market-intelligence" element={<MarketIntelligence />} />
              <Route path="/customer-portfolio" element={<CustomerPortfolio />} />
              <Route path="/pricing-conditions" element={<PricingConditions />} />
              <Route path="/operations" element={<Operations />} />
              <Route path="/pricing-deep-dive" element={<PricingDeepDive />} />
              <Route path="/cost-deep-dive" element={<CostDeepDive />} />
              <Route path="/price-engine" element={<PriceEngine />} />
              <Route path="/data-connections" element={<DataConnections />} />
              <Route path="/implementation" element={<ImplementationFAQ />} />
            </Routes>
          </main>
        </div>
      </div>
    </FilterProvider>
  )
}
