import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/profile-edit-page.module.css';
import { userService } from '@/services/apiService';
import { buildImageUrl } from '@/utils/image';
import BackButton from '@/components/ui/buttons/BackButton';

// Gmail-style default avatar with first letter
const DefaultAvatar = ({ name, size = 96 }) => {
  const firstChar = (name || '?').charAt(0).toUpperCase();

  // Generate consistent color based on name
  const colors = [
    '#4285F4', '#EA4335', '#FBBC05', '#34A853', // Google colors
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  const bgColor = colors[colorIndex];

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: bgColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.45,
      fontWeight: 600,
      color: '#fff',
      flexShrink: 0
    }}>
      {firstChar}
    </div>
  );
};

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [nickname, setNickname] = useState('');
  const [originalNickname, setOriginalNickname] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [originalProfileImage, setOriginalProfileImage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const hasChanges = (nickname.trim() !== originalNickname.trim() && nickname.trim() !== '') || selectedFile !== null;

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
          if (user?.profileImage) {
            setProfileImage(user.profileImage);
            setOriginalProfileImage(user.profileImage);
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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('파일 크기는 5MB 이하여야 합니다');
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      // Upload image first if selected
      let imageUrl = profileImage;
      if (selectedFile) {
        setIsUploading(true);
        const uploadResponse = await userService.uploadProfileImage(selectedFile);
        if (uploadResponse.success) {
          imageUrl = uploadResponse.data.imageUrl;
        } else {
          throw new Error(uploadResponse.message || '이미지 업로드 실패');
        }
        setIsUploading(false);
      }

      // Update profile with nickname and image URL
      const updateData = {};
      if (nickname.trim() !== originalNickname) {
        updateData.nickname = nickname.trim();
      }
      if (imageUrl !== originalProfileImage) {
        updateData.profileImage = imageUrl;
      }

      if (Object.keys(updateData).length > 0) {
        const response = await userService.updateProfile(updateData);
        if (response.success) {
          setOriginalNickname(nickname.trim());
          setOriginalProfileImage(imageUrl);
          navigate(-1);
        } else {
          setError(response.message || t('profile.edit.errors.saveFailed'));
        }
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError(err.message || t('profile.edit.errors.saveFailed'));
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.iphoneProMax}>
      <div className={styles.div}>
        {/* Header */}
        <header className={styles.header}>
          <BackButton />
          <h1 className={styles.pageTitle}>{t('profile.edit.title')}</h1>
          <div className={styles.headerSpacer} />
        </header>

        {/* Profile Image Section */}
        <div className={styles.profileSection}>
          <div
            className={styles.profileImageWrapper}
            onClick={handleImageClick}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            {previewUrl || profileImage ? (
              <img
                src={previewUrl || buildImageUrl(profileImage)}
                alt={t('profile.edit.profileImageAlt')}
                className={styles.profileImage}
              />
            ) : (
              <DefaultAvatar name={nickname || t('profile.defaultNickname')} size={96} />
            )}
            <div className={styles.imageOverlay}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
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
            <button className={styles.saveButton} onClick={handleSave} disabled={isSaving || isUploading}>
              {isUploading ? '이미지 업로드 중...' : isSaving ? t('profile.edit.saving') : t('common.save')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
