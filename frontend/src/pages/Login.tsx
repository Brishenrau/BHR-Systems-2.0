import { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Logo } from '../components/common/Logo';

export const Login = () => {
  const { login, loading, error } = useAuth();
  const [payNumber, setPayNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState<{ payNumber?: string; password?: string }>({});

  const validateForm = () => {
    const errors: { payNumber?: string; password?: string } = {};
    
    if (!payNumber.trim()) {
      errors.payNumber = 'Pay number is required';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login({ payNumber: payNumber.trim(), password });
      // Handle remember me if needed
      if (rememberMe) {
        // Store preference in localStorage or cookie
        localStorage.setItem('rememberMe', 'true');
      }
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Placeholder for social login functionality
    console.log(`Social login with ${provider}`);
    // TODO: Implement social login
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/background.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-gray-900/20"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
          {/* Logo */}
          <Logo />

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-300">Sign in to continue to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Pay Number Input */}
            <Input
              label="Pay Number"
              type="text"
              name="payNumber"
              value={payNumber}
              onChange={(e) => setPayNumber(e.target.value)}
              placeholder="Enter your pay number"
              error={formErrors.payNumber}
              autoComplete="username"
              disabled={loading}
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white">Password</label>
                <button
                  type="button"
                  className="text-sm text-cyan-400 hover:text-cyan-300 focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                error={formErrors.password}
                autoComplete="current-password"
                disabled={loading}
                required
                showPasswordToggle
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me for 30 days
              </label>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="orange"
              isLoading={loading}
              disabled={loading}
              className="w-full py-3 text-lg font-semibold"
            >
              Sign in →
            </Button>
          </form>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-800 text-gray-400">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <span className="text-sm font-medium text-gray-700">G</span>
              <span className="ml-1 text-xs text-gray-600">Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C1.79 15.25 4.18 5.87 9.45 5.65c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01.01zM12.03 3.75c-.15-2.23 1.66-4.07 3.77-4.44.47 2.37-.87 4.7-3.77 4.44z"/>
              </svg>
            </button>
          </div>

          {/* Registration Link */}
          <div className="text-center text-sm text-gray-400">
            <span>Don't have an account? </span>
            <button
              type="button"
              className="text-cyan-400 hover:text-cyan-300 focus:outline-none font-medium"
            >
              Create one now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
