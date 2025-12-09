import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface SignUpPageProps {
  onSignUp: (name: string, email: string, password: string) => void;
  onNavigateToSignIn: () => void;
}

export default function SignUpPage({ onSignUp, onNavigateToSignIn }: SignUpPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
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

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onSignUp(name, email, password);
      setIsLoading(false);
      toast.success("Account created successfully!");
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[#2c3968] mb-3">Create Account</h1>
          <p className="text-[#666]">Join our community of phone enthusiasts</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#e5e5e5] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block mb-2 text-[#1e1e1e]">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block mb-2 text-[#1e1e1e]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block mb-2 text-[#1e1e1e]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#2c3968] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-[#1e1e1e]">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#2c3968] transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white py-3.5 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6 flex items-center justify-center"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e5e5]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[#999]">or</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-[#666]">
              Already have an account?{" "}
              <button
                onClick={onNavigateToSignIn}
                className="text-[#2c3968] hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center text-[#999] mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
