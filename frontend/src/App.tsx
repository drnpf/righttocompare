import { useState, useEffect, lazy, Suspense } from "react";

// MUST LOAD
import NavigationBar from "./imports/NavigationBar";
import FooterBar from "./imports/FooterBar";
import { DarkModeProvider } from "./components/DarkModeContext";
import { Toaster } from "sonner@2.0.3";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// LAZY LOADED WHENEVER NEEDED
const PhoneSpecPage = lazy(() => import("./components/PhoneSpecPage"));
const PhoneComparisonPage = lazy(() => import("./components/PhoneComparisonPage"));
const PhoneCatalogPage = lazy(() => import("./components/PhoneCatalogPage"));
const DiscussionsPage = lazy(() => import("./components/DiscussionsPage"));
const DiscussionDetailPage = lazy(() => import("./components/DiscussionDetailPage"));
const SignInPage = lazy(() => import("./components/SignInPage"));
const SignUpPage = lazy(() => import("./components/SignUpPage"));
const UserProfilePage = lazy(() => import("./components/UserProfilePage"));
const AdminDashboardPage = lazy(() => import("./components/AdminDashboardPage"));
const AIChatWidget = lazy(() => import("./components/AIChatWidget"));
const PasswordResetPage = lazy(() => import("./components/PasswordResetPage"));

// All Application pages
type PageType =
  | "spec"
  | "comparison"
  | "catalog"
  | "discussions"
  | "discussionDetail"
  | "signIn"
  | "signUp"
  | "profile"
  | "admin"
  | "passwordReset";

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
  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(null);
  const [pageType, setPageType] = useState<PageType>("catalog");
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
      setPageType("passwordReset");
    }
  }, []);

  // Add current page to recently viewed when it changes
  useEffect(() => {
    if (pageType === "spec" && selectedPhoneId) {
      setRecentlyViewedPhones((prev) => {
        // Remove the current phone if it already exists
        const filtered = prev.filter((id) => id !== selectedPhoneId);
        // Add current phone to the beginning
        const updated = [selectedPhoneId, ...filtered].slice(0, 8); // Keep max 8 phones
        saveRecentlyViewedToStorage(updated);
        return updated;
      });
    }
  }, [selectedPhoneId, pageType]);

  const navigateToPhone = (phoneId: string) => {
    setSelectedPhoneId(phoneId);
    setPageType("spec");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToComparison = (phoneIds: string[]) => {
    setComparisonPhoneIds(phoneIds);
    setPageType("comparison");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToSpecs = () => {
    setPageType("spec");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Add a phone to recently viewed without navigating
  const addPhoneToRecentlyViewed = (phoneId: string) => {
    setRecentlyViewedPhones((prev) => {
      // Remove the phone if it already exists
      const filtered = prev.filter((id) => id !== phoneId);
      // Add phone to the beginning
      const updated = [phoneId, ...filtered].slice(0, 8); // Keep max 8 phones
      saveRecentlyViewedToStorage(updated);
      return updated;
    });
  };

  const handleComparisonToolClick = () => {
    // Always navigate to comparison page - it will handle empty states
    setPageType("comparison");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDiscussionsClick = () => {
    setPageType("discussions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewDiscussion = (discussionId: string) => {
    setCurrentDiscussionId(discussionId);
    setPageType("discussionDetail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToDiscussions = () => {
    setPageType("discussions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignInClick = () => {
    setPageType("signIn");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignUpClick = () => {
    setPageType("signUp");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignInSuccess = () => {
    // Navigate to profile page after successful sign in
    setPageType("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignUpSuccess = () => {
    // Navigate to profile page after successful sign up
    setPageType("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignOut = async () => {
    await signOut();
    setPageType("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProfileClick = () => {
    setPageType("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdminClick = () => {
    setPageType("admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCatalogClick = () => {
    setPageType("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogoClick = () => {
    // Navigate to catalog page
    setPageType("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0d1117] flex flex-col transition-colors duration-300">
        <Toaster position="top-right" richColors />
        <div className="relative h-[80px] shrink-0">
          <NavigationBar
            onComparisonToolClick={handleComparisonToolClick}
            onDiscussionsClick={handleDiscussionsClick}
            isAuthenticated={currentUser !== null}
            user={currentUser}
            onSignInClick={handleSignInClick}
            onSignOut={handleSignOut}
            onProfileClick={handleProfileClick}
            onAdminClick={handleAdminClick}
            onCatalogClick={handleCatalogClick}
            onLogoClick={handleLogoClick}
          />
        </div>

        <main className="flex-1">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2c3968] dark:border-[#4a7cf6]"></div>
              </div>
            }
          >
            {pageType === "passwordReset" ? (
              <PasswordResetPage onNavigateToSignIn={handleSignInClick} />
            ) : pageType === "admin" ? (
              <ProtectedRoute adminOnly onNavigateToCatalog={handleCatalogClick}>
                <AdminDashboardPage />
              </ProtectedRoute>
            ) : pageType === "profile" ? (
              <UserProfilePage />
            ) : pageType === "signIn" ? (
              <SignInPage onSignInSuccess={handleSignInSuccess} onNavigateToSignUp={handleSignUpClick} />
            ) : pageType === "signUp" ? (
              <SignUpPage onSignUpSuccess={handleSignUpSuccess} onNavigateToSignIn={handleSignInClick} />
            ) : pageType === "discussionDetail" ? (
              <DiscussionDetailPage discussionId={currentDiscussionId} onBack={handleBackToDiscussions} />
            ) : pageType === "discussions" ? (
              <DiscussionsPage onNavigate={navigateToPhone} onViewDiscussion={handleViewDiscussion} />
            ) : pageType === "comparison" ? (
              <PhoneComparisonPage
                phoneIds={comparisonPhoneIds}
                onRemovePhone={handleRemoveFromComparison}
                onBackToSpecs={handleBackToSpecs}
                onAddPhone={handleAddToComparison}
                onNavigate={navigateToPhone}
                recentlyViewedPhones={recentlyViewedPhones}
              />
            ) : pageType === "catalog" ? (
              <PhoneCatalogPage
                onNavigate={navigateToPhone}
                comparisonPhoneIds={comparisonPhoneIds}
                onComparisonChange={setComparisonPhoneIds}
                onNavigateToComparison={navigateToComparison}
                recentlyViewedPhones={recentlyViewedPhones}
              />
            ) : selectedPhoneId ? (
              <PhoneSpecPage
                phoneId={selectedPhoneId}
                onNavigate={navigateToPhone}
                onNavigateToComparison={navigateToComparison}
                comparisonPhoneIds={comparisonPhoneIds}
                onComparisonChange={setComparisonPhoneIds}
                recentlyViewedPhones={recentlyViewedPhones}
                onAddToRecentlyViewed={addPhoneToRecentlyViewed}
                onNavigateToCatalog={handleCatalogClick}
              />
            ) : (
              <div className="max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 pt-8">
                <div className="bg-white dark:bg-[#161b26] rounded-2xl shadow-sm p-12 text-center">
                  <h2 className="text-[#2c3968] dark:text-[#4a7cf6] mb-3">Phone Not Found</h2>
                  <p className="text-[#666] dark:text-[#a0a8b8]">The phone you're looking for doesn't exist.</p>
                </div>
              </div>
            )}
          </Suspense>
        </main>

        <div className="relative h-[60px] shrink-0 mt-12">
          <FooterBar />
        </div>

        {/* AI Chat Widget */}
        <AIChatWidget onNavigate={navigateToPhone} />
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
