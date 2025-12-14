import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

interface SignInPageProps {
  onSignIn: (email: string, password: string) => void;
  onNavigateToSignUp: () => void;
}

export default function SignInPage({ onSignIn, onNavigateToSignUp }: SignInPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onSignIn(email, password);
      setIsLoading(false);
      toast.success("Welcome back!");
    }, 800);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    if (!resetEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsResetting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsResetting(false);
      setShowForgotPassword(false);
      setResetEmail("");
      toast.success("Password reset link sent! Check your email.");
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[#2c3968] dark:text-[#4a7cf6] mb-3">Welcome Back</h1>
          <p className="text-[#666] dark:text-[#a0a8b8]">Sign in to your account to continue</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white dark:bg-[#161b26] rounded-2xl shadow-lg border border-[#e5e5e5] dark:border-[#2d3548] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block mb-2 text-[#1e1e1e] dark:text-white">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] dark:border-[#2d3548] bg-white dark:bg-[#1a1f2e] text-[#1e1e1e] dark:text-white placeholder:text-[#b3b3b3] dark:placeholder:text-[#707070] focus:border-[#2c3968] dark:focus:border-[#4a7cf6] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 dark:focus:ring-[#4a7cf6]/20 transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block mb-2 text-[#1e1e1e] dark:text-white">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] dark:border-[#2d3548] bg-white dark:bg-[#1a1f2e] text-[#1e1e1e] dark:text-white placeholder:text-[#b3b3b3] dark:placeholder:text-[#707070] focus:border-[#2c3968] dark:focus:border-[#4a7cf6] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 dark:focus:ring-[#4a7cf6]/20 transition-all pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] dark:text-[#a0a8b8] hover:text-[#2c3968] dark:hover:text-[#4a7cf6] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-[#2c3968] dark:text-[#4a7cf6] hover:underline transition-colors"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white py-3.5 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e5e5] dark:border-[#2d3548]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-[#161b26] px-4 text-[#999] dark:text-[#707070]">or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-[#666] dark:text-[#a0a8b8]">
              Don't have an account?{" "}
              <button
                onClick={onNavigateToSignUp}
                className="text-[#2c3968] dark:text-[#4a7cf6] hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center text-[#999] dark:text-[#707070] mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Password Recovery Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="bg-white dark:bg-[#1a1f2e] border-[#e5e5e5] dark:border-[#2d3548]">
          <DialogHeader>
            <DialogTitle className="text-[#2c3968] dark:text-[#4a7cf6]">Reset Password</DialogTitle>
            <DialogDescription className="text-[#666] dark:text-[#a0a8b8]">
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="space-y-4 mt-4">
            <div>
              <label htmlFor="reset-email" className="block mb-2 text-[#1e1e1e] dark:text-white">
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] dark:border-[#2d3548] bg-white dark:bg-[#161b26] text-[#1e1e1e] dark:text-white placeholder:text-[#b3b3b3] dark:placeholder:text-[#707070] focus:border-[#2c3968] dark:focus:border-[#4a7cf6] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 dark:focus:ring-[#4a7cf6]/20 transition-all"
                disabled={isResetting}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="px-4 py-2 rounded-lg border border-[#d9d9d9] dark:border-[#2d3548] text-[#666] dark:text-[#a0a8b8] hover:bg-[#f7f7f7] dark:hover:bg-[#252b3d] transition-colors"
                disabled={isResetting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isResetting}
                className="px-4 py-2 bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isResetting ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}