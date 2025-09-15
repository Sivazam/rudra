'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';

export default function VerifyPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const router = useRouter();

  useEffect(() => {
    const storedPhone = sessionStorage.getItem('phoneNumber');
    if (!storedPhone) {
      router.push('/auth/login');
      return;
    }
    setPhoneNumber(storedPhone);

    // Timer for resend OTP
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const confirmationResult = window.confirmationResult;
      const result = await confirmationResult.confirm(otp);
      
      // User signed in successfully
      const user = result.user;
      
      // Get ID token
      const idToken = await user.getIdToken();
      
      // Send token to backend to create session
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          phoneNumber: user.phoneNumber
        }),
      });

      if (response.ok) {
        // Clear session storage
        sessionStorage.removeItem('phoneNumber');
        // Redirect to home page
        router.push('/');
      } else {
        setError('Failed to verify OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setTimer(30);
      setOtp('');
      setError('');
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+91')) {
      return `+91 ${phone.slice(3, 8)} ${phone.slice(8)}`;
    }
    return phone;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Verify OTP</CardTitle>
          <CardDescription className="text-gray-600">
            Enter the 6-digit code sent to {formatPhoneNumber(phoneNumber)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <button
              onClick={handleResendOTP}
              disabled={resendLoading || timer > 0}
              className="text-sm text-orange-600 hover:text-orange-700 disabled:text-gray-400"
            >
              {resendLoading ? 'Resending...' : timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
            </button>
            
            <button
              onClick={() => router.push('/auth/login')}
              className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-700 w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Change phone number
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}