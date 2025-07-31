import React, { useState } from 'react';
import styles from '@/styles/components/inputs/form-input.module.css';

export default function FormInput({ 
  label, 
  placeholder, 
  type = 'text', 
  value, 
  onChange,
  className = '',
  ...props 
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`${styles.container} ${className}`}>
      <label className={styles.label}>
        {label}
      </label>
      <div className={styles.inputWrapper}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${styles.input} ${isFocused ? styles.focused : ''}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        <div className={`${styles.underline} ${isFocused ? styles.underlineFocused : ''}`} />
      </div>
    </div>
  );
}