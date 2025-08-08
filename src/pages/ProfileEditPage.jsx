import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/profile-edit-page.module.css';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('석현'); // Start with original nickname
  const [originalNickname] = useState('석현'); // Original nickname
  const hasChanges = nickname.trim() !== originalNickname.trim() && nickname.trim() !== '';


  const handleClose = () => {
    navigate(-1);
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  const handleSave = () => {
    console.log('Saving nickname:', nickname);
    // TODO: Save nickname to backend
    navigate(-1);
  };

  return (
    <div className={styles.iphoneProMax}>
      <div className={styles.div}>
        {/* Header - BackButton now handled globally */}
        <header className={styles.header}>
        </header>
        
        {/* Profile Image Section */}
        <div className={styles.profileSection}>
          <div className={styles.profileImageWrapper}>
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" 
              alt="프로필" 
              className={styles.profileImage}
            />
          </div>
        </div>

        <div className={styles.overlap}>
          <div className={styles.group}>
            <div className={styles.overlapGroup}>
              <div className={styles.rectangleWrapper}>
                <div className={styles.rectangle}></div>
              </div>
              <input
                type="text"
                value={nickname}
                onChange={handleNicknameChange}
                className={styles.nicknameInput}
                placeholder="닉네임을 입력하세요"
              />
            </div>
          </div>
          
          <div className={styles.close} onClick={handleClose}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.4" d="M14.8409 1.83325H7.15921C3.82254 1.83325 1.83337 3.82242 1.83337 7.15909V14.8316C1.83337 18.1774 3.82254 20.1666 7.15921 20.1666H14.8317C18.1684 20.1666 20.1575 18.1774 20.1575 14.8408V7.15909C20.1667 3.82242 18.1775 1.83325 14.8409 1.83325Z" fill="#D3D3D3"/>
              <path d="M15.3752 14.4029L11.9723 11L15.3752 7.59701C15.641 7.33125 15.641 6.89049 15.3752 6.62473C15.1095 6.35898 14.6687 6.35898 14.403 6.62473L11 10.0277L7.59705 6.62473C7.33129 6.35898 6.89053 6.35898 6.62478 6.62473C6.35902 6.89049 6.35902 7.33125 6.62478 7.59701L10.0277 11L6.62478 14.4029C6.35902 14.6687 6.35902 15.1094 6.62478 15.3752C6.89053 15.6409 7.33129 15.6409 7.59705 15.3752L11 11.9722L14.403 15.3752C14.6687 15.6409 15.1095 15.6409 15.3752 15.3752C15.641 15.1094 15.641 14.6687 15.3752 14.4029Z" fill="white"/>
            </svg>
          </div>
        </div>

        {/* Save Button - appears when input changes */}
        {hasChanges && (
          <div className={styles.saveButtonContainer}>
            <button className={styles.saveButton} onClick={handleSave}>
              저장
            </button>
          </div>
        )}
      </div>
    </div>
  );
}