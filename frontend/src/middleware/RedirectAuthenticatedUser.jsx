import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// Redirect authenticated users to the home page
export const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/" replace />
  }

  // return the current page
  return children
}
