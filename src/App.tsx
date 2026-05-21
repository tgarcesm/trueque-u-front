import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AdminRoute from './components/AdminRoute.tsx'
import GuestRoute from './components/GuestRoute.tsx'
import Navbar from './components/Navbar.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import AdminDashboardPage from './pages/AdminDashboardPage.tsx'
import ChatPage from './pages/ChatPage.tsx'
import FavoritesPage from './pages/FavoritesPage.tsx'
import ListingDetailPage from './pages/ListingDetailPage.tsx'
import ListingsPage from './pages/ListingsPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import PublishPage from './pages/PublishPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import { isAuthenticated } from './utils/auth.ts'

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

function RootRedirect() {
  return <Navigate to={isAuthenticated() ? "/listings" : "/login"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/publish" element={<PublishPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/chat/:id" element={<ChatPage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
