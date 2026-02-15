import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2c3968] border-r-transparent"></div>
          <p className="mt-4 text-[#666]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h2 className="text-[#2c3968] mb-4">Authentication Required</h2>
          <p className="text-[#666] mb-6">
            You need to sign in to access this page.
          </p>
          <button
            onClick={() => window.location.hash = '#signin'}
            className="bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
