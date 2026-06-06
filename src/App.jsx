import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Nav from './components/layout/Nav'
import Home from './pages/Home'
import Fixtures from './pages/Fixtures'
import Groups from './pages/Groups'
import Teams from './pages/Teams'
import Squad from './pages/Squad'
import Leaderboard from './pages/Leaderboard'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:teamId" element={<Squad />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
