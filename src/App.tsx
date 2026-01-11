// import { useState } from 'react'
import './App.css'
import './index.css'
import ParamInput from '@/components/param-input'
import CurrentInstance from '@/components/current-instance'
import Playground from '@/components/playground'



function App() {
  return (
    <div className='h-full text-left'>
      <div className='text-4xl font-bold mt-4 mb-4'>2D Bin Packing solver</div>
      <div className='mb-2'>Given a set of rectangles and a fixed box size, place all rectangles without overlap into the smallest possible number of square boxes. Rectangles may be rotated and must fit entirely within a box. This problem can be solved with <strong>local search</strong> methods with different neighborhoods or <strong>greedy heuristics</strong>.</div>
      <div className='mb-2'>The placement strategy for Greedy here is <strong>Shelf Best Height Fit</strong>.</div>
      <div className="font-normal text-sm text-gray-400">(The latest instance, including its generation settings and results, is saved in local storage)</div>

      <div className='grid grid-cols-12 gap-3 mt-4'>
        <div className='col-span-3'><ParamInput/></div>
        <div className='col-span-3'><CurrentInstance/></div>
        <div className='col-span-6'><Playground/></div>


      </div>
    </div>
  )
}

export default App
