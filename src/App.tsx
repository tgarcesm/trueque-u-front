import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ChatPage from './pages/ChatPage'
import FavoritesPage from './pages/FavoritesPage'
import ListingDetailPage from './pages/ListingDetailPage'
import ListingsPage from './pages/ListingsPage'
import LoginPage from './pages/LoginPage'
import PublishPage from './pages/PublishPage'
import RegisterPage from './pages/RegisterPage'

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/listings" replace />} />
        <Route element={<Layout />}>
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/publish" element={<PublishPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
