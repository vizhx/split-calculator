import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BillSplitCalculator from './BillCalculatorApp'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BillSplitCalculator />
  </StrictMode>,
)
