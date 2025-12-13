import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/profile-settings-page.module.css';
import ProfileMenuItem from '@/components/ui/items/ProfileMenuItem';
import ProfileInfoCard from '@/components/ui/cards/ProfileInfoCard';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  BookmarkIcon,
  ProfileIcon,
  RecentPlacesIcon,
  VersionIcon,
  LogoutIcon
} from '@/components/ui/icons/MenuIcons';
import { userService } from '@/services/apiService';
import { authService } from '@/services/authService';

// Menu items configuration factory function
const getMenuItems = (t) => [
  {
    id: 'bookmarks',
    icon: <BookmarkIcon />,
    text: t('profile.menu.bookmarks'),
    route: '/bookmarks',
    className: styles.group8,
    vectorSrc: '/vector-2526.svg',
    directionLeftClass: styles.directionLeft,
    textClass: styles.textWrapper6,
    groupClass: styles.group9,
    innerGroupClass: styles.group10
  },
  {
    id: 'profile',
    icon: <ProfileIcon />,
    text: t('profile.menu.profile'),
    route: '/profile-edit',
    className: styles.group11,
    vectorSrc: '/vector-2525.svg',
    directionLeftClass: styles.directionLeft2,
    textClass: styles.textWrapper6,
    groupClass: styles.group9,
    innerGroupClass: styles.group10
  },
  {
    id: 'recentPlaces',
    icon: <RecentPlacesIcon />,
    text: t('profile.menu.recentPlaces'),
    route: '/recent-view',
    className: styles.group12,
    vectorSrc: '/vector-2529-2.svg',
    directionLeftClass: styles.directionLeft3,
    textClass: styles.textWrapper7,
    groupClass: styles.group9,
    innerGroupClass: styles.group13
  },
  {
    id: 'version',
    icon: <VersionIcon />,
    text: t('profile.menu.version'),
    route: null,
    className: styles.group14,
    vectorSrc: '/vector-2529.svg',
    directionLeftClass: '',
    textClass: styles.textWrapper8,
    groupClass: styles.group15,
    innerGroupClass: styles.group16,
    showArrow: false
  },
  {
    id: 'logout',
    icon: <LogoutIcon />,
    text: '로그아웃',
    route: null,
    action: 'logout',
    className: styles.group17,
    vectorSrc: '/vector-2529.svg',
    directionLeftClass: '',
    textClass: styles.textWrapper9,
    groupClass: styles.group18,
    innerGroupClass: styles.group19,
    showArrow: false
  }
];


export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isGuest } = useAuthGuard(true); // This page requires authentication
  const [profile, setProfile] = useState(null);
  const MENU_ITEMS = getMenuItems(t);
  const userDescription = profile?.mbti
    ? t('profile.mbtiDescription', { mbti: profile.mbti })
    : t('profile.defaultDescription');

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileResponse = await userService.getProfile();

        if (profileResponse.success) {
          setProfile(profileResponse.data?.user);
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    if (!isGuest) {
      loadData();
    }
  }, [isGuest, location.pathname]);

  const handleMenuItemClick = async (item) => {
    if (item.action === 'logout') {
      // Handle logout
      try {
        await authService.logout();
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Logout failed:', error);
        authService.clearAuthData();
        navigate('/', { replace: true });
      }
    } else if (item.route) {
      navigate(item.route);
    } else {
      console.log(`Navigate to ${item.text}`);
    }
  };

  const handleMBTIClick = () => {
    navigate('/mbti-edit');
  };

  return (
    <div className={styles.iphoneProMax}>
      <div className={styles.div}>
        {/* Header - BackButton now handled globally */}
        <header className={styles.header}>
        </header>

        {/* Profile Header */}
        <ProfileInfoCard
          styles={styles}
          userName={profile?.nickname || t('profile.defaultNickname')}
          mbtiValue={profile?.mbti || '----'}
          userDescription={userDescription}
          profileImage={profile?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'}
          onMBTIClick={handleMBTIClick}
        />

        {/* Menu Section */}
        <div className={styles.overlap}>
          <div className={styles.divWrapper}>
            <div className={styles.group7}>
              {MENU_ITEMS.map((item) => (
                <ProfileMenuItem
                  key={item.id}
                  className={item.className}
                  onClick={() => handleMenuItemClick(item)}
                  vectorSrc={item.vectorSrc}
                  icon={item.icon}
                  text={item.text}
                  showArrow={item.showArrow !== false}
                  directionLeftClass={item.directionLeftClass}
                  textClass={item.textClass}
                  groupClass={item.groupClass}
                  innerGroupClass={item.innerGroupClass}
                  styles={styles}
                />
              ))}
            </div>
          </div>
          <div className={styles.element}>1.0.0</div>
        </div>

        {/* Mood-based section */}
        <section className={styles.moodSection}>
          <div className={styles.moodCard}>
            <div className={styles.moodContent}>
              <h3 className={styles.moodTitle}>{t('profile.moodSection.title')}</h3>
              <p className={styles.moodDescription}>
                {t('profile.moodSection.description').split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < t('profile.moodSection.description').split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>
            <div className={styles.moodImage}>
              <img src="/src/assets/image/banner_left.png" alt="Mood illustration" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
