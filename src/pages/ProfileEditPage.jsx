import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/profile-edit-page.module.css';
import { userService } from '@/services/apiService';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [nickname, setNickname] = useState('');
  const [originalNickname, setOriginalNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const hasChanges = nickname.trim() !== originalNickname.trim() && nickname.trim() !== '';

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await userService.getProfile();
        if (response.success) {
          const user = response.data?.user;
          if (user?.nickname) {
            setNickname(user.nickname);
            setOriginalNickname(user.nickname);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };

    loadProfile();
  }, []);


  const handleClose = () => {
    navigate(-1);
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      const response = await userService.updateProfile({ nickname: nickname.trim() });
      if (response.success) {
        setOriginalNickname(nickname.trim());
        navigate(-1);
      } else {
        setError(response.message || t('profile.edit.errors.saveFailed'));
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError(err.message || t('profile.edit.errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
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
              alt={t('profile.edit.profileImageAlt')}
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
                placeholder={t('profile.edit.nicknamePlaceholder')}
                disabled={isSaving}
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

        {error && (
          <div style={{
            color: '#dc2626',
            fontSize: '14px',
            textAlign: 'center',
            marginTop: '12px'
          }}>{error}</div>
        )}

        {/* Save Button - appears when input changes */}
        {hasChanges && (
          <div className={styles.saveButtonContainer}>
            <button className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
              {isSaving ? t('profile.edit.saving') : t('common.save')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
