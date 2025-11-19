import './App.css'
import { Route, Routes } from 'react-router'
import Layout from './utils/layout'


function App() {


  return (
    <>
  <Routes>
    <Route path='/' element={<Layout />}/>
  </Routes>
  
    </>
  )
}

export default App
