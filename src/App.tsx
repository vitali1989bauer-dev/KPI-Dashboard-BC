import { Routes, Route } from 'react-router-dom'
import { FilterProvider } from './FilterContext'
import Sidebar from './components/Sidebar'
import FilterBar from './components/FilterBar'
import TopKPIs from './pages/TopKPIs'
import SCOEffect from './pages/SCOEffect'
import ConditionSpending from './pages/ConditionSpending'
import PricingDeepDive from './pages/PricingDeepDive'
import VolumeDeepDive from './pages/VolumeDeepDive'
import CostDeepDive from './pages/CostDeepDive'
import TargetPrices from './pages/TargetPrices'
import OtherDeepDive from './pages/OtherDeepDive'

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
              <Route path="/condition-spending" element={<ConditionSpending />} />
              <Route path="/pricing-deep-dive" element={<PricingDeepDive />} />
              <Route path="/target-prices" element={<TargetPrices />} />
              <Route path="/volume-deep-dive" element={<VolumeDeepDive />} />
              <Route path="/cost-deep-dive" element={<CostDeepDive />} />
              <Route path="/other-deep-dive" element={<OtherDeepDive />} />
            </Routes>
          </main>
        </div>
      </div>
    </FilterProvider>
  )
}
