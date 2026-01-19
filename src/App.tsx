import './App.css'
import './index.css'
import ParamInput from '@/components/ParamInput'
import CurrentInstance from '@/components/CurrentInstance'
import Playground from '@/components/Playground'

import { createContext, useState, type Dispatch, type SetStateAction } from 'react';
import { Instance, Solution } from '@/models/binpacking'

export const MainContext = createContext<{
  instance: Instance | null;
  setInstance: Dispatch<SetStateAction<Instance | null>>;

  solution: Solution | null;
  setSolution: Dispatch<SetStateAction<Solution | null>>;
} | null>(null);

function App() {
  const [instance, setInstance] = useState<Instance | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);

  return (
    <MainContext value={{instance, setInstance, solution, setSolution}}>
      <div className='h-full text-left'>
        <div className='text-4xl font-bold mt-4 mb-4'>2D Bin Packing solver</div>
        <div className='mb-2'>Given a set of rectangles and a fixed box size, place all rectangles without overlap into the smallest possible number of square boxes. Rectangles may be rotated and must fit entirely within a box. This problem can be solved with <strong>local search</strong> methods with different neighborhoods or <strong>greedy heuristics</strong>.</div>
        <div className='mb-2'>The placement strategy for Greedy here is <strong>Shelf First Fit</strong>.</div>
        <div className="font-normal text-sm text-gray-400">(The latest instance, including its generation settings and results, is saved in local storage)</div>

        {/** 3 components, Input, Current Instance settings, and Playground */}
        <div className='grid grid-cols-1 md:grid-cols-12 gap-3 mt-4'>
          <div className='col-span-1 md:col-span-3 flex flex-col gap-3'>
            <ParamInput/>
            <CurrentInstance/>
          </div>
          <div className='col-span-1 md:col-span-9'><Playground/></div>

        </div>
      </div>
    </MainContext>
  )
}

export default App
