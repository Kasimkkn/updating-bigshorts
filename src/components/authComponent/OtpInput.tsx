import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { ModerSpinner } from '../LoadingSpinner';
import Button from '../shared/Button';
import Input from '../shared/Input';

interface OtpInputProps {
  value?: string;
  setOtpInput: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (otp: number) => void;
  setOtpLoading: React.Dispatch<React.SetStateAction<boolean>>;
  otpLoading: boolean
}

const OtpInput: React.FC<OtpInputProps> = ({ value, setOtpInput, onSubmit, setOtpLoading, otpLoading }) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const otpRefs = useRef<HTMLInputElement[]>([]);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [resendVisible, setResendVisible] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const newChar = e.target.value;
    if (/^[0-9]$|^$/.test(newChar)) {
      const newOtp = [...otp];
      newOtp[index] = newChar;
      setOtp(newOtp);

      if (newChar && index < otpRefs.current.length - 1) {
        otpRefs.current[index + 1].focus();
      }

      if (newOtp.join('').length === 6) {
        setOtpLoading(true);
        onSubmit(parseInt(newOtp.join('')));
      } else {
        setError(null);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '') {
      e.preventDefault();
      if (index > 0) {
        otpRefs.current[index - 1].focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        setError(null);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text');
    if (/^\d{6}$/.test(pasteData)) {
      setOtp(pasteData.split(''));
      otpRefs.current.forEach((input, index) => {
        input.value = pasteData[index];
      });
      setOtpLoading(true);
      onSubmit(parseInt(pasteData));
    }
  };

  const handleBtnClick = () => {
    const otpStr = otp.join('');
    setOtpLoading(true);
    onSubmit(parseInt(otpStr));
  };

  const handleResend = () => {
    setOtp(Array(6).fill(''));
    setResendVisible(false);
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(interval);
          setResendVisible(true);
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  };

  useEffect(() => {
    otpRefs.current[0]?.focus();
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(interval);
          setResendVisible(true);
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-3 text-text-color">Enter OTP</h2>
      <h4 className="text-lg font-normal text-center mb-4 text-text-color">
        Enter 6 digit OTP sent to {value} <span onClick={() => setOtpInput(false)} className="linearText underline">Edit?</span>
      </h4>
      <div className="flex justify-center gap-3 flex-col">
        <div className="grid grid-cols-6 gap-2">
          {otp.map((char, index) => (
            <Input
              key={index}
              ref={(el) => {
                if (el) {
                  otpRefs.current[index] = el;
                }
              }}
              type="text"
              maxLength={1}
              value={char}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className={`p-2  ${error ? 'border-red-500' : 'border-border-color'}`}
              style={{ borderColor: error && otp.join('').length === 6 ? 'red' : '' }}
            />
          ))}
        </div>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        <Button
          onClick={handleBtnClick}
          disabled={otpLoading}
          isLinearBtn={true}
        >
          {otpLoading ? <ModerSpinner /> : 'Verify OTP'}
        </Button>
      </div>
      {!resendVisible ? (
        <p className="text-center mt-4 text-text-color">Resend in <span className='linearText'>00:{timer < 10 ? `0${timer}` : timer}</span></p>
      ) : (
        <h4 className="text-lg font-normal text-center mt-4 text-text-color">
          Didn&#39;t receive OTP? <span className="underline linearText font-bold cursor-pointer" onClick={handleResend}>Resend</span>
        </h4>
      )}
    </div>
  );
};

export default OtpInput;
