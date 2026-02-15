import { useState, useEffect } from "react";
import NavigationBar from "./imports/NavigationBar";
import FooterBar from "./imports/FooterBar";
import PhoneSpecPage from "./components/PhoneSpecPage";
import PhoneComparisonPage from "./components/PhoneComparisonPage";
import PhoneCatalogPage from "./components/PhoneCatalogPage";
import DiscussionsPage from "./components/DiscussionsPage";
import DiscussionDetailPage from "./components/DiscussionDetailPage";
import SignInPage from "./components/SignInPage";
import SignUpPage from "./components/SignUpPage";
import UserProfilePage from "./components/UserProfilePage";
import AdminDashboardPage from "./components/AdminDashboardPage";
import AIChatWidget from "./components/AIChatWidget";
import { phonesData } from "./data/phoneData";
import { Toaster } from "sonner@2.0.3";
import { DarkModeProvider } from "./components/DarkModeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import FirebaseConnectionTest from "./components/FirebaseConnectionTest";
import PasswordResetPage from "./components/PasswordResetPage";
import { Shield } from "lucide-react";
import { Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import BackToTopButton from "./components/BackToTopButton";

// Helper functions for localStorage
const getRecentlyViewedFromStorage = (): string[] => {
  try {
    const stored = localStorage.getItem("recentlyViewedPhones");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentlyViewedToStorage = (phoneIds: string[]) => {
  try {
    localStorage.setItem("recentlyViewedPhones", JSON.stringify(phoneIds));
  } catch {
    // Ignore storage errors
  }
};

function AppContent() {
  const { currentUser, signOut } = useAuth();
  // React Router hook
  const navigate = useNavigate();

  const [comparisonPhoneIds, setComparisonPhoneIds] = useState<string[]>([]);
  const [recentlyViewedPhones, setRecentlyViewedPhones] = useState<string[]>([]);
  const [currentDiscussionId, setCurrentDiscussionId] = useState<string>("");

  // Load recently viewed phones and user from localStorage on mount
  useEffect(() => {
    const stored = getRecentlyViewedFromStorage();
    setRecentlyViewedPhones(stored);

    // Check if URL contains password reset code
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get("oobCode");
    const mode = urlParams.get("mode");

    // If there's a password reset code in the URL, navigate to password reset page
    if (oobCode && mode === "resetPassword") {
      navigate("/password-reset", {replace: true});
    }
  }, []);

  // Add a phone to recently viewed
  const addPhoneToRecentlyViewed = (phoneId: string) => {
    setRecentlyViewedPhones((prev) => {
      const filtered = prev.filter((id) => id !== phoneId);
      const updated = [phoneId, ...filtered].slice(0, 8);
      saveRecentlyViewedToStorage(updated);
      return updated;
    });
  };

  // Navigation functions
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
            onSignInClick={handleSignInClick}
            onSignOut={handleSignOut}
            onProfileClick={handleProfileClick}
            onAdminClick={handleAdminClick}
            onCatalogClick={handleCatalogClick}
            onLogoClick={handleLogoClick}
          />
        </div>

        <main className="flex-1">
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
            <Route path="/discussions" element={<DiscussionsPage onNavigate={handleNavigateToPhone} onViewDiscussion={handleViewDiscussion} />} />
            <Route path="/discussions/:discussionId" element={<DiscussionDetailPage discussionId={currentDiscussionId} onBack={handleBackToDiscussions} />} />

            {/* Auth */}
            <Route path="/sign-in" element={<SignInPage onSignInSuccess={handleSignInSuccess} onNavigateToSignUp={handleSignUpClick} />} />
            <Route path="/sign-up" element={<SignUpPage onSignUpSuccess={handleSignUpSuccess} onNavigateToSignIn={handleSignInClick} />} />
            <Route path="/profile" element={currentUser ? <UserProfilePage /> : <Navigate to="/sign-in" />} />

            {/* Admin */}
            <Route path="/admin" element={currentUser?.role === "admin" ? <AdminDashboardPage /> : <Navigate to="/" />} />

            {/* Password reset */}
            <Route path="/password-reset" element={<PasswordResetPage onNavigateToSignIn={handleSignInClick} />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <div className="relative h-[60px] shrink-0 mt-12">
          <FooterBar />
        </div>

        {/* AI Chat Widget */}
        <AIChatWidget onNavigate={handleNavigateToPhone} />

        {/* Back to Top Button */}
        <BackToTopButton />

        {/* Firebase Connection Test - Remove this after testing */}
        {/* <FirebaseConnectionTest /> */}
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
