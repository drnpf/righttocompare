import svgPaths from "./svg-caqd896ugm";
import imgRightToCompareNameSlogan from "figma:asset/9f0492f671cd59d55bfede5826dae0ba5a04987c.png";
import imgRightToCompareIcon from "figma:asset/18bcc14c7462237f04633edea2ae040313d21786.png";
import { User, LogOut, UserCircle, Shield, Moon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDarkMode } from "../components/DarkModeContext";

/**
 * @figmaAssetKey 2f445a571b3309ebad6f453668e4e71c19f9efae
 */
function LogoButton({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`${className} cursor-pointer hover:opacity-80 transition-opacity`}
      data-name="Logo Button"
    >
      <div className="absolute aspect-[664/146] left-[18.04%] right-0 top-0" data-name="RightToCompare_name_slogan">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
          src={imgRightToCompareNameSlogan}
        />
      </div>
      <div className="absolute aspect-[70/70] left-0 right-[81.96%] top-0" data-name="RightToCompare_icon">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
          src={imgRightToCompareIcon}
        />
      </div>
    </button>
  );
}

interface User {
  displayName?: string | null;
  email: string | null;
}

function NavigationBarLinks({
  onComparisonToolClick,
  onDiscussionsClick,
  isAuthenticated,
  user,
  onSignInClick,
  onSignOut,
  onProfileClick,
  onAdminClick,
  onCatalogClick,
}: {
  onComparisonToolClick?: () => void;
  onDiscussionsClick?: () => void;
  isAuthenticated: boolean;
  user: User | null;
  onSignInClick?: () => void;
  onSignOut?: () => void;
  onProfileClick?: () => void;
  onAdminClick?: () => void;
  onCatalogClick?: () => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Safe function for getting display name.
   * @returns Returns current user's display name
   */
  const getDisplayName = () => {
    if (!user) return "";
    return user.displayName || user.email?.split("@")[0] || "User";
  };
  const displayName = getDisplayName();

  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Navigation Bar Links">
      <button
        onClick={toggleDarkMode}
        className="overflow-clip relative shrink-0 size-[32px] hover:opacity-70 transition-opacity cursor-pointer"
        data-name="Dark Mode/Light Mode"
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <div className="absolute inset-[4.167%]" data-name="Icon">
          {isDarkMode ? (
            <div
              className="absolute inset-[-6.818%]"
              style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}
            >
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34 34">
                <path
                  d={svgPaths.p39896bf0}
                  id="Icon"
                  stroke="var(--stroke-0, #FFFFFF)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
              </svg>
            </div>
          ) : (
            <Moon className="w-full h-full text-[#1e1e1e]" strokeWidth={2.5} />
          )}
        </div>
      </button>
      <div
        className="content-start flex flex-wrap gap-[8px] items-center relative shrink-0"
        data-name="Navigation Bar Pill List"
      >
        <button
          onClick={onCatalogClick}
          className="box-border content-stretch flex gap-[8px] items-center justify-center p-[8px] relative rounded-[8px] shrink-0 hover:bg-[#f0f0f0] dark:hover:bg-[#1e2530] transition-colors cursor-pointer"
          data-name="Catalog"
        >
          <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1e1e1e] dark:text-white text-[0px] text-nowrap">
            <p className="font-['Inter:Bold',sans-serif] font-bold leading-none text-[16px] whitespace-pre">Catalog</p>
          </div>
        </button>
        <button
          onClick={onComparisonToolClick}
          className="box-border content-stretch flex gap-[8px] items-center justify-center p-[8px] relative rounded-[8px] shrink-0 hover:bg-[#f0f0f0] dark:hover:bg-[#1e2530] transition-colors cursor-pointer"
          data-name="Comparison Tool"
        >
          <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1e1e1e] dark:text-white text-[0px] text-nowrap">
            <p className="font-['Inter:Bold',sans-serif] font-bold leading-none text-[16px] whitespace-pre">
              Comparison Tool
            </p>
          </div>
        </button>
        <button
          onClick={onDiscussionsClick}
          className="box-border content-stretch hidden lg:flex gap-[8px] items-center justify-center p-[8px] relative rounded-[8px] shrink-0 hover:bg-[#f0f0f0] dark:hover:bg-[#1e2530] transition-colors cursor-pointer"
          data-name="Discussions"
        >
          <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1e1e1e] dark:text-white text-[0px] text-nowrap">
            <p className="font-['Inter:Bold',sans-serif] font-bold leading-none text-[16px] whitespace-pre">
              Discussions
            </p>
          </div>
        </button>

        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] box-border flex gap-[10px] items-center justify-center px-[16px] md:px-[20px] py-[12px] relative rounded-[100px] shrink-0 hover:shadow-lg transition-all cursor-pointer"
              data-name="Profile Button"
            >
              <div className="bg-white rounded-full p-1.5">
                <User size={18} className="text-[#2c3968]" />
              </div>
              <div className="hidden md:flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center items-center not-italic relative shrink-0 text-white text-nowrap">
                <p className="font-['Inter:Bold',sans-serif] font-bold leading-none text-[14px] md:text-[16px] whitespace-pre">
                  {displayName.split(" ")[0]}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-[#1a1f2e] rounded-xl shadow-xl border border-[#e5e5e5] dark:border-[#2d3548] py-2 min-w-[200px] z-[1000]">
                <div className="px-4 py-3 border-b border-[#e5e5e5] dark:border-[#2d3548]">
                  <p className="font-['Inter:Bold',sans-serif] text-[#1e1e1e] dark:text-white">{displayName}</p>
                  <p className="text-[#666] dark:text-[#a0a0a0] text-[14px]">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    onProfileClick?.();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#f7f7f7] dark:hover:bg-[#252b3d] transition-colors text-left"
                >
                  <UserCircle size={18} className="text-[#666] dark:text-[#a0a0a0]" />
                  <span className="text-[#1e1e1e] dark:text-white">Profile</span>
                </button>
                <button
                  onClick={() => {
                    onAdminClick?.();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#f7f7f7] dark:hover:bg-[#252b3d] transition-colors text-left"
                >
                  <Shield size={18} className="text-[#666] dark:text-[#a0a0a0]" />
                  <span className="text-[#1e1e1e] dark:text-white">Admin Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    onSignOut?.();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#f7f7f7] dark:hover:bg-[#252b3d] transition-colors text-left"
                >
                  <LogOut size={18} className="text-[#666] dark:text-[#a0a0a0]" />
                  <span className="text-[#1e1e1e] dark:text-white">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onSignInClick}
            className="bg-[#2c3968] box-border flex items-center justify-center px-[16px] md:px-[24px] py-[12px] relative rounded-[100px] shrink-0 hover:bg-[#3d4a7a] transition-colors cursor-pointer"
            data-name="Navigation Pill"
          >
            <p className="font-['Inter:Bold',sans-serif] font-bold leading-none text-[14px] md:text-[16px] text-white whitespace-nowrap">
              Sign In
            </p>
          </button>
        )}
      </div>
    </div>
  );
}

function NavigationBarLayout({
  onComparisonToolClick,
  onDiscussionsClick,
  isAuthenticated,
  user,
  onSignInClick,
  onSignOut,
  onProfileClick,
  onAdminClick,
  onCatalogClick,
  onLogoClick,
}: {
  onComparisonToolClick?: () => void;
  onDiscussionsClick?: () => void;
  isAuthenticated: boolean;
  user: User | null;
  onSignInClick?: () => void;
  onSignOut?: () => void;
  onProfileClick?: () => void;
  onAdminClick?: () => void;
  onCatalogClick?: () => void;
  onLogoClick?: () => void;
}) {
  return (
    <div
      className="absolute content-stretch flex h-[80px] items-center justify-between left-0 right-0 top-1/2 translate-y-[-50%] w-full max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 gap-2 md:gap-4"
      data-name="Navigation Bar Layout"
    >
      <LogoButton className="h-[50px] md:h-[70px] relative shrink-0 w-[250px] md:w-[388px]" onClick={onLogoClick} />
      {/* Spacer to maintain layout spacing where search bar was */}
      <div className="relative shrink-0 w-full max-w-[300px] md:max-w-[400px] hidden sm:block" />
      <NavigationBarLinks
        onComparisonToolClick={onComparisonToolClick}
        onDiscussionsClick={onDiscussionsClick}
        isAuthenticated={isAuthenticated}
        user={user}
        onSignInClick={onSignInClick}
        onSignOut={onSignOut}
        onProfileClick={onProfileClick}
        onAdminClick={onAdminClick}
        onCatalogClick={onCatalogClick}
      />
    </div>
  );
}

export default function NavigationBar({
  onComparisonToolClick,
  onDiscussionsClick,
  isAuthenticated,
  user,
  onSignInClick,
  onSignOut,
  onProfileClick,
  onAdminClick,
  onCatalogClick,
  onLogoClick,
}: {
  onComparisonToolClick?: () => void;
  onDiscussionsClick?: () => void;
  isAuthenticated: boolean;
  user: User | null;
  onSignInClick?: () => void;
  onSignOut?: () => void;
  onProfileClick?: () => void;
  onAdminClick?: () => void;
  onCatalogClick?: () => void;
  onLogoClick?: () => void;
}) {
  return (
    <div
      className="bg-white dark:bg-[#161b26] border-b border-[#e5e5e5] dark:border-[#2d3548] overflow-visible fixed left-0 right-0 top-0 h-[80px] z-[999] transition-colors duration-300"
      data-name="Navigation Bar"
    >
      <NavigationBarLayout
        onComparisonToolClick={onComparisonToolClick}
        onDiscussionsClick={onDiscussionsClick}
        isAuthenticated={isAuthenticated}
        user={user}
        onSignInClick={onSignInClick}
        onSignOut={onSignOut}
        onProfileClick={onProfileClick}
        onAdminClick={onAdminClick}
        onCatalogClick={onCatalogClick}
        onLogoClick={onLogoClick}
      />
    </div>
  );
}
