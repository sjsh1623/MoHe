import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/profile-settings-page.module.css';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/contexts';
import { userService, bookmarkService } from '@/services/apiService';
import { buildImageUrl } from '@/utils/image';
import BackButton from '@/components/ui/buttons/BackButton';

// Icons
const BookmarkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="#7D848D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#7D848D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#7D848D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RecentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#7D848D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 6V12L16 14" stroke="#7D848D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VersionIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#7D848D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16V12" stroke="#7D848D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8H12.01" stroke="#7D848D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#7D848D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17L21 12L16 7" stroke="#7D848D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H9" stroke="#7D848D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke="#AEB5BC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isGuest } = useAuthGuard(true);
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileResponse, bookmarksResponse] = await Promise.all([
          userService.getProfile(),
          bookmarkService.getUserBookmarks({ page: 0, size: 1 })
        ]);

        if (profileResponse.success) {
          setProfile(profileResponse.data?.user);
        }
        if (bookmarksResponse.success) {
          setBookmarkCount(bookmarksResponse.data?.totalElements || 0);
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    if (!isGuest) {
      loadData();
    }
  }, [isGuest, location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/', { replace: true });
    }
  };

  const userDescription = profile?.mbti
    ? t('profile.mbtiDescription', { mbti: profile.mbti })
    : t('profile.defaultDescription');

  return (
    <div className={styles.container}>
      {/* Header with Back Button */}
      <header className={styles.header}>
        <BackButton />
      </header>

      {/* Profile Header */}
      <div className={styles.profileHeader}>
        {profile?.profileImage ? (
          <img
            className={styles.profileImage}
            src={buildImageUrl(profile.profileImage)}
            alt="프로필"
          />
        ) : (
          <div style={{ marginBottom: 16 }}>
            <DefaultAvatar name={profile?.nickname || profile?.email || t('profile.defaultNickname')} size={96} />
          </div>
        )}
        <h1 className={styles.userName}>{profile?.nickname || t('profile.defaultNickname')}</h1>
        <p className={styles.userDescription}>{userDescription}</p>

        {/* Stats Row - MBTI and Saved Places */}
        <div className={styles.statsRow}>
          <div className={styles.statItem} onClick={() => navigate('/mbti-edit')}>
            <span className={styles.statLabel}>MBTI</span>
            <span className={styles.statValue}>{profile?.mbti || '----'}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem} onClick={() => navigate('/bookmarks')}>
            <span className={styles.statLabel}>저장한 장소</span>
            <span className={styles.statValue}>{bookmarkCount}</span>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className={styles.menuSection}>
        <div className={styles.menuItem} onClick={() => navigate('/bookmarks')}>
          <div className={styles.menuLeft}>
            <BookmarkIcon />
            <span>{t('profile.menu.bookmarks')}</span>
          </div>
          <ChevronRight />
        </div>

        <div className={styles.menuItem} onClick={() => navigate('/profile-edit')}>
          <div className={styles.menuLeft}>
            <ProfileIcon />
            <span>{t('profile.menu.profile')}</span>
          </div>
          <ChevronRight />
        </div>

        <div className={styles.menuItem} onClick={() => navigate('/recent-view')}>
          <div className={styles.menuLeft}>
            <RecentIcon />
            <span>{t('profile.menu.recentPlaces')}</span>
          </div>
          <ChevronRight />
        </div>

        <div className={styles.menuItem}>
          <div className={styles.menuLeft}>
            <VersionIcon />
            <span>{t('profile.menu.version')}</span>
          </div>
          <span className={styles.versionText}>1.0.0</span>
        </div>

        <div className={styles.menuItem} onClick={handleLogout}>
          <div className={styles.menuLeft}>
            <LogoutIcon />
            <span>로그아웃</span>
          </div>
        </div>
      </div>

      {/* Footer Card */}
      <div className={styles.footerCard}>
        <div className={styles.footerContent}>
          <h3 className={styles.footerTitle}>{t('profile.moodSection.title')}</h3>
          <p className={styles.footerDescription}>
            {t('profile.moodSection.description').split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < t('profile.moodSection.description').split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
