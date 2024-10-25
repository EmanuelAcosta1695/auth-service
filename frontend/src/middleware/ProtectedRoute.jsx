import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// Protect routes that require authentication
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />
  }

  return children
}
