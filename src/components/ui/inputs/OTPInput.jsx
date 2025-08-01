import React, { useState, useRef, useEffect } from 'react';
import styles from '@/styles/components/inputs/otp-input.module.css';

export default function OTPInput({ 
  length = 5, 
  value = '', 
  onChange, 
  onComplete,
  className = '',
  ...props 
}) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== otp.join('')) {
      const newOtp = value.split('').slice(0, length);
      while (newOtp.length < length) {
        newOtp.push('');
      }
      setOtp(newOtp);
    }
  }, [value, length]);

  const handleChange = (index, inputValue) => {
    // Only allow single digit
    const digit = inputValue.replace(/[^0-9]/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Call onChange callback
    const otpString = newOtp.join('');
    if (onChange) {
      onChange(otpString);
    }

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all fields are filled
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        
        if (onChange) {
          onChange(newOtp.join(''));
        }
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    const pastedArray = pastedData.split('').slice(0, length);
    
    const newOtp = [...otp];
    pastedArray.forEach((digit, index) => {
      if (index < length) {
        newOtp[index] = digit;
      }
    });
    
    // Fill remaining with empty strings
    while (newOtp.length < length) {
      newOtp.push('');
    }
    
    setOtp(newOtp);
    
    if (onChange) {
      onChange(newOtp.join(''));
    }

    // Focus next empty input or last input
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
    inputRefs.current[focusIndex]?.focus();

    // Call onComplete if fully filled
    if (newOtp.join('').length === length && onComplete) {
      onComplete(newOtp.join(''));
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`${styles.input} ${digit ? styles.filled : ''}`}
          {...props}
        />
      ))}
    </div>
  );
}