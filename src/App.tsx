import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import FilterBar from './components/FilterBar'
import TopKPIs from './pages/TopKPIs'
import SCOEffect from './pages/SCOEffect'
import ConditionSpending from './pages/ConditionSpending'
import PricingDeepDive from './pages/PricingDeepDive'
import VolumeDeepDive from './pages/VolumeDeepDive'
import CostDeepDive from './pages/CostDeepDive'
import OtherDeepDive from './pages/OtherDeepDive'

export default function App() {
  const [timePeriod, setTimePeriod] = useState('YTD')

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <FilterBar activeTimePeriod={timePeriod} onTimePeriodChange={setTimePeriod} />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<TopKPIs />} />
            <Route path="/sco-effect" element={<SCOEffect />} />
            <Route path="/condition-spending" element={<ConditionSpending />} />
            <Route path="/pricing-deep-dive" element={<PricingDeepDive />} />
            <Route path="/volume-deep-dive" element={<VolumeDeepDive />} />
            <Route path="/cost-deep-dive" element={<CostDeepDive />} />
            <Route path="/other-deep-dive" element={<OtherDeepDive />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
