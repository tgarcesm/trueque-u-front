import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AdminRoute from './components/AdminRoute.tsx'
import GuestRoute from './components/GuestRoute.tsx'
import Navbar from './components/Navbar.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import AdminDashboardPage from './pages/AdminDashboardPage.tsx'
import ChatPage from './pages/ChatPage.tsx'
import ChatsListPage from './pages/ChatsListPage.tsx'
import FavoritesPage from './pages/FavoritesPage.tsx'
import ListingDetailPage from './pages/ListingDetailPage.tsx'
import ListingsEntry from './components/ListingsEntry.tsx'
import AdminListingsPage from './pages/AdminListingsPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import PublishPage from './pages/PublishPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import { isAdmin, isAuthenticated } from './utils/auth.ts'

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

function RootRedirect() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={isAdmin() ? "/admin" : "/listings"} replace />;
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
            <Route path="/listings" element={<ListingsEntry />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/publish" element={<PublishPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users/:userId" element={<ProfilePage />} />
            <Route path="/chats" element={<ChatsListPage />} />
            <Route path="/chat/:id" element={<ChatPage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/listings" element={<AdminListingsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
