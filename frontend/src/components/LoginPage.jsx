import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { X, Lock, ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { auth } from '../api/auth';

const TIMER_DURATION = 240;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (location.state?.mobilenumber) setMobileNumber(location.state.mobilenumber);
  }, [location]);

  useEffect(() => {
    if (step !== 'otp') return;
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) { setCanResend(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const handleClose = () => navigate(location.state?.redirectTo || -1);

const handleSendOTP = async (e) => {
  e.preventDefault();

  if (!mobileNumber || mobileNumber.length !== 10) {
    toast.error('Please enter a valid 10-digit mobile number');
    return;
  }

  setLoading(true);
  try {
    await auth.sendOTP(mobileNumber);
    toast.success('OTP sent successfully!');
    setStep('otp');
    setTimer(TIMER_DURATION);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  } catch (error) {
    // Check if backend says "not registered" / "user not found"
    const errorMsg = error?.message || error?.toString() || '';
    
    if (
      errorMsg.toLowerCase().includes('not registered') || 
      errorMsg.toLowerCase().includes('not found') ||
      errorMsg.toLowerCase().includes('does not exist') ||
      errorMsg.toLowerCase().includes('no account')
    ) {
      toast.info('This number is not registered. Please create an account.');
      
      // Wait briefly so user sees the toast before navigating
      setTimeout(() => {
        navigate('/signup', {
          state: {
            mobilenumber: mobileNumber,
            redirectTo: location.state?.redirectTo || '/',
          },
        });
      }, 800); // adjust timing as needed
      
    } else {
      toast.error(errorMsg || 'Failed to send OTP');
    }
  } finally {
    setLoading(false);
  }
};
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const getOtpString = () => otp.join('');

  const afterSuccessfulLogin = async (token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    window.dispatchEvent(new StorageEvent('storage'));
    toast.success('Login successful!');
    const pendingItem = localStorage.getItem('pendingCartItem');
    if (pendingItem) {
      const item = JSON.parse(pendingItem);
      const { addToCart } = await import('../utils/CartStorage');
      addToCart(item.product, item.quantity);
      localStorage.removeItem('pendingCartItem');
      window.dispatchEvent(new Event('cart:open'));
    }
    navigate(location.state?.redirectTo || '/');
  };

 const handleVerifyOTP = async (e) => {
  e.preventDefault();
  const otpStr = getOtpString();

  if (otpStr.length !== 6) {
    toast.error('Please enter complete 6-digit OTP');
    return;
  }

  setLoading(true);

  try {
    const res = await auth.verifyOTP(mobileNumber, otpStr);

    if (res.access_token) {
      await afterSuccessfulLogin(res.access_token, res.user);
    } else {
      toast.error('Invalid OTP');
    }

  } catch (error) {
    toast.error(error.message || 'Invalid OTP. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      await auth.sendOTP(mobileNumber);
      toast.success('OTP resent!');
      setTimer(TIMER_DURATION);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      toast.error('Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 z-[9000] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-gray-100 text-gray-500 hover:text-gray-900 hover:rotate-90 transition-all duration-300 shadow-sm"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="px-6 sm:px-10 py-8 sm:py-10">
          
          {/* Lock Icon with glow */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-2xl blur-xl opacity-40"
                style={{ backgroundColor: 'var(--primary, #00897B)' }}
              ></div>
              <div 
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, var(--primary, #00897B), #00695C)' 
                }}
              >
                <Lock size={24} className="text-white" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {step === 'mobile' ? 'Welcome Back' : 'Verify OTP'}
            </h2>
            <p className="text-sm text-gray-500">
              {step === 'mobile' 
                ? 'Sign in with your mobile number to continue' 
                : `Code sent to +91 ${mobileNumber}`}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 'mobile' ? 'w-8' : 'w-6'}`}
              style={{ backgroundColor: 'var(--primary, #00897B)' }}></div>
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 'otp' ? 'w-8' : 'w-6 bg-gray-200'}`}
              style={step === 'otp' ? { backgroundColor: 'var(--primary, #00897B)' } : {}}></div>
          </div>

          {/* Mobile Input */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
              Mobile Number
            </label>
            <div className="relative group">
              <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pointer-events-none border-r border-gray-200">
                <span className="text-gray-700 font-semibold pr-3">+91</span>
              </div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '');
                  if (cleaned.length <= 10) setMobileNumber(cleaned);
                }}
                className="w-full pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary,#00897B)] focus:bg-white focus:ring-1 focus:ring-[var(--primary,#00897B)]/30 transition-all text-base font-medium placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="98765 43210"
                maxLength={10}
                disabled={step === 'otp' || loading}
              />
              {mobileNumber.length === 10 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <CheckCircle2 size={20} style={{ color: 'var(--primary, #00897B)' }} />
                </div>
              )}
            </div>
          </div>

          {/* Send OTP Button */}
          {step === 'mobile' && (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={loading || mobileNumber.length !== 10}
              className="group relative w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, var(--primary, #00897B), #00695C)',
                boxShadow: '0 10px 30px -10px rgba(0, 137, 123, 0.5)'
              }}
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          )}

          {/* OTP Section */}
          {step === 'otp' && (
            <>
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  Enter 6-Digit OTP
                </label>
                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => inputRefs.current[idx] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className={`w-11 h-12 sm:w-12 sm:h-14 bg-gray-50 border rounded-xl text-center text-xl sm:text-2xl font-bold focus:outline-none focus:bg-white focus:ring-1 focus:ring-[var(--primary,#00897B)]/30 transition-all ${
                        digit ? 'border-[var(--primary,#00897B)] bg-white' : 'border-gray-200'
                      }`}
                      style={{ color: digit ? 'var(--primary, #00897B)' : '#374151' }}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              {/* Resend Row */}
              <div className="flex items-center justify-between mb-6 text-sm bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-gray-600">Didn't receive code?</span>
                {!canResend ? (
                  <span className="font-bold tabular-nums" style={{ color: 'var(--primary, #00897B)' }}>
                    {formatTime(timer)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="font-bold hover:underline disabled:opacity-50"
                    style={{ color: 'var(--primary, #00897B)' }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={loading || getOtpString().length !== 6}
                className="group relative w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden mb-4"
                style={{ 
                  background: 'linear-gradient(135deg, var(--primary, #00897B), #00695C)',
                  boxShadow: '0 10px 30px -10px rgba(0, 137, 123, 0.5)'
                }}
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Login
                      <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setStep('mobile'); setOtp(['','','','','','']); }}
                className="w-full text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                ← Change mobile number
              </button>
            </>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              By continuing, you agree to our{' '}
              <span className="underline cursor-pointer hover:text-gray-700">Terms</span>
              {' '}&{' '}
              <span className="underline cursor-pointer hover:text-gray-700">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;