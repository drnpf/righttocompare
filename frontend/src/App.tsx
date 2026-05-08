import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner@2.0.3";
import { AuthProvider, useAuth } from "./context/AuthContext";

// UI Components
import { DarkModeProvider } from "./components/DarkModeContext";
import NavigationBar from "./imports/NavigationBar";
import FooterBar from "./imports/FooterBar";
import BackToTopButton from "./components/BackToTopButton";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Pages (Lazy Loaded)
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const PhoneSpecPage = lazy(() => import("./components/PhoneSpecPage"));
const PhoneComparisonPage = lazy(() => import("./components/PhoneComparisonPage"));
const PhoneCatalogPage = lazy(() => import("./components/PhoneCatalogPage"));
const DiscussionsPage = lazy(() => import("./components/DiscussionsPage"));
const DiscussionDetailPage = lazy(() => import("./components/DiscussionDetailPage"));
const SignInPage = lazy(() => import("./components/SignInPage"));
const SignUpPage = lazy(() => import("./components/SignUpPage"));
const UserProfilePage = lazy(() => import("./components/UserProfilePage"));
const AdminDashboardPage = lazy(() => import("./components/AdminDashboardPage"));
const PasswordResetPage = lazy(() => import("./components/PasswordResetPage"));
const TrendsPage = lazy(() => import("./components/TrendsPage"));

// UI Component (Lazy Loaded)
const AIChatWidget = lazy(() => import("./components/AIChatWidget"));

// Helper function for getting Recently Viewed phones from localStorage
const getRecentlyViewedFromStorage = (): string[] => {
  try {
    const stored = localStorage.getItem("recentlyViewedPhones");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper function for saving Recently Viewed phones to localStorage
const saveRecentlyViewedToStorage = (phoneIds: string[]) => {
  try {
    localStorage.setItem("recentlyViewedPhones", JSON.stringify(phoneIds));
  } catch {
    // Ignore storage errors
  }
};

// Helper function for getting currently compared phones from localStorage
const getComparisonFromStorage = (): string[] => {
  try {
    const stored = localStorage.getItem("comparisonPhoneIds");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper function for saving currently compared phones to localStorage
const saveComparisonToStorage = (phoneIds: string[]) => {
  try {
    localStorage.setItem("comparisonPhoneIds", JSON.stringify(phoneIds));
  } catch {
    // Ignore storage errors
  }
};

function AppContent() {
  // ------------------------------------------------------------
  // | HOOKS
  // -----------------------------------------------------------
  const { currentUser, loading: authLoading, signOut } = useAuth();

  // React Router hook
  const navigate = useNavigate();
  const location = useLocation();

  // --- Data States ---
  const [comparisonPhoneIds, setComparisonPhoneIds] = useState<string[]>([]);
  const [recentlyViewedPhones, setRecentlyViewedPhones] = useState<string[]>([]);
  const [currentDiscussionId, setCurrentDiscussionId] = useState<string>("");

  // ------------------------------------------------------------
  // | DATA SYNCHRONIZATION (REFRESHES)
  // ------------------------------------------------------------

  // Add a phone to recently viewed without navigating
  const addPhoneToRecentlyViewed = useCallback((phoneId: string) => {
    setRecentlyViewedPhones((prev) => {
      const filtered = prev.filter((id) => id !== phoneId);
      const updated = [phoneId, ...filtered].slice(0, 8);
      saveRecentlyViewedToStorage(updated);
      return updated;
    });
  }, []);

  /**
   * APP INITIALIZATION: Runs once on mount to handle fetching from
   * local storage and URL-based routing like password resetting
   * Action: Fetching recently viewed phones and comparison from local
   * storage and checking URL for OOB code for password resetting.
   */
  useEffect(() => {
    /**
     * RECENTLY VIEWED
     */
    const stored = getRecentlyViewedFromStorage();
    setRecentlyViewedPhones(stored);

    /**
     * COMPARISONS
     */
    const storedCompare = getComparisonFromStorage();
    if (storedCompare.length > 0) {
      setComparisonPhoneIds(storedCompare);
    }

    /**
     * PASSWORD RESET
     */
    // Check if URL contains password reset code
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get("oobCode");
    const mode = urlParams.get("mode");

    // If there's a password reset code in the URL, navigate to password reset page
    if (oobCode && mode === "resetPassword") {
      navigate("/password-reset", { replace: true });
    }
  }, []);

  /**
   * PROTECT SIGN-IN/SIGN-UP PAGES FROM AUTHENTICATED USERS
   * Signal: Change to current user, URL path, or call of navigate function
   * Action: On sign-in or sign-up page entry while an authorized user, navigates directly
   * to current user's profile page
   */
  useEffect(() => {
    // Navigates to profile if current user is already authorized user when accessing sign-in or sign-up
    const isAuthPage = location.pathname === "/sign-in" || location.pathname === "/sign-up";
    if (currentUser && isAuthPage) navigate("/profile", { replace: true });
  }, [currentUser, location.pathname, navigate]);

  /**
   * COMPARISON PERSISTENCE:
   * Signal: Any changes to the comparisonPhoneIds array (i.e. adding new phone)
   * Action: Syncs current comparison ID list to localStorage; keeps compares
   * persistent on refresh
   */
  useEffect(() => {
    saveComparisonToStorage(comparisonPhoneIds);
  }, [comparisonPhoneIds]);

  // Update compare page URL whenever user adds/removes phones to compare cart
  useEffect(() => {
    if (location.pathname !== "/compare") return;

    if (comparisonPhoneIds.length === 0) {
      navigate("/compare", { replace: true });
    } else {
      const phoneQuery = comparisonPhoneIds.join(",");
      navigate(`/compare?phones=${phoneQuery}`, { replace: true });
    }
  }, [comparisonPhoneIds, location.pathname]);

  // Update compare page URL on page refresh
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const phones = params.get("phones");

    if (phones) {
      setComparisonPhoneIds(phones.split(","));
    }
  }, []);

  // ------------------------------------------------------------
  // | UI FUNCTIONS
  // -----------------------------------------------------------

  const handleRemoveFromComparison = (phoneId: string) => {
    const updatedIds = comparisonPhoneIds.filter((id) => id !== phoneId);
    setComparisonPhoneIds(updatedIds);
  };

  const handleAddToComparison = (phoneId: string) => {
    if (!comparisonPhoneIds.includes(phoneId) && comparisonPhoneIds.length < 3) {
      setComparisonPhoneIds([...comparisonPhoneIds, phoneId]);
      // Also add to recently viewed
      addPhoneToRecentlyViewed(phoneId);
    }
  };

  // ------------------------------------------------------------
  // | NAVIGATION FUNCTIONS
  // ------------------------------------------------------------
  const handleNavigateToPhone = (phoneId: string) => {
    addPhoneToRecentlyViewed(phoneId);
    navigate(`/phones/${phoneId}`);
  };

  const handleNavigateToComparison = () => {
    navigate("/compare");
  };

  const handleDiscussionsClick = () => {
    navigate("/discussions");
  };

  const handleViewDiscussion = (discussionId: string) => {
    setCurrentDiscussionId(discussionId);
    navigate(`/discussions/${discussionId}`);
  };

  const handleSignInClick = () => {
    navigate("/sign-in");
  };

  const handleSignUpClick = () => {
    navigate("/sign-up");
  };

  const handleSignInSuccess = () => {
    navigate("/profile");
  };

  const handleSignUpSuccess = () => {
    navigate("/profile");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleAdminClick = () => {
    navigate("/admin");
  };

  const handleCatalogClick = () => {
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleBackToDiscussions = () => {
    navigate("/discussions");
  };

  const handleTrendsClick = () => {
    navigate("/trends");
  };

  // ------------------------------------------------------------
  // | UI SECTION
  // -----------------------------------------------------------
  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0d1117] flex flex-col transition-colors duration-300">
        <Toaster position="top-right" richColors />
        <div className="relative h-[80px] shrink-0">
          <NavigationBar
            isAuthenticated={currentUser !== null}
            user={currentUser}
            onComparisonToolClick={handleNavigateToComparison}
            onDiscussionsClick={handleDiscussionsClick}
            onTrendsClick={handleTrendsClick}
            onSignInClick={handleSignInClick}
            onSignOut={handleSignOut}
            onProfileClick={handleProfileClick}
            onAdminClick={handleAdminClick}
            onCatalogClick={handleCatalogClick}
            onLogoClick={handleLogoClick}
          />
        </div>

        <main className="flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Catalog page */}
              <Route
                path="/"
                element={
                  <PhoneCatalogPage
                    onNavigate={handleNavigateToPhone}
                    comparisonPhoneIds={comparisonPhoneIds}
                    onComparisonChange={setComparisonPhoneIds}
                    onNavigateToComparison={handleNavigateToComparison}
                    recentlyViewedPhones={recentlyViewedPhones}
                  />
                }
              />

              {/* Phone detail page */}
              <Route
                path="/phones/:phoneId"
                element={
                  <PhoneSpecPage
                    comparisonPhoneIds={comparisonPhoneIds}
                    onComparisonChange={setComparisonPhoneIds}
                    recentlyViewedPhones={recentlyViewedPhones}
                    onAddToRecentlyViewed={addPhoneToRecentlyViewed}
                    onNavigateToComparison={handleNavigateToComparison}
                  />
                }
              />

              {/* Comparison page */}
              <Route
                path="/compare"
                element={
                  <PhoneComparisonPage
                    phoneIds={comparisonPhoneIds}
                    onRemovePhone={handleRemoveFromComparison}
                    onAddPhone={handleAddToComparison}
                    recentlyViewedPhones={recentlyViewedPhones}
                    onNavigate={handleNavigateToPhone}
                  />
                }
              />

              {/* Discussions */}
              <Route
                path="/discussions"
                element={<DiscussionsPage onNavigate={handleNavigateToPhone} onViewDiscussion={handleViewDiscussion} />}
              />
              <Route
                path="/discussions/:discussionId"
                element={<DiscussionDetailPage discussionId={currentDiscussionId} onBack={handleBackToDiscussions} />}
              />

              {/* Auth */}
              <Route
                path="/sign-in"
                element={<SignInPage onSignInSuccess={handleSignInSuccess} onNavigateToSignUp={handleSignUpClick} />}
              />
              <Route
                path="/sign-up"
                element={<SignUpPage onSignUpSuccess={handleSignUpSuccess} onNavigateToSignIn={handleSignInClick} />}
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute onNavigateToSignIn={handleSignInClick}>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute
                    adminOnly
                    onNavigateToCatalog={handleCatalogClick}
                    onNavigateToSignIn={handleSignInClick}
                  >
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Password reset */}
              <Route path="/password-reset" element={<PasswordResetPage onNavigateToSignIn={handleSignInClick} />} />

              {/* Trends Page */}
              <Route
                path="/trends"
                element={
                  <TrendsPage
                    comparisonPhoneIds={comparisonPhoneIds}
                    onCompare={handleAddToComparison}
                    onRemove={handleRemoveFromComparison}
                    onViewDetails={handleNavigateToPhone}
                  />
                }
              />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <div className="relative h-[60px] shrink-0 mt-12">
          <FooterBar />
        </div>

        {/* AI Chat Widget */}
        <AIChatWidget onNavigate={handleNavigateToPhone} />

        {/* Back to Top Button */}
        <BackToTopButton />
      </div>
    </DarkModeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
