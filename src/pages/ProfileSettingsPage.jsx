import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/profile-settings-page.module.css';
import ProfileMenuItem from '@/components/ui/items/ProfileMenuItem';
import ProfileInfoCard from '@/components/ui/cards/ProfileInfoCard';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { 
  BookmarkIcon, 
  ProfileIcon, 
  MyPlacesIcon, 
  RecentPlacesIcon, 
  VersionIcon 
} from '@/components/ui/icons/MenuIcons';
import { userService, activityService } from '@/services/apiService';

// Menu items configuration with exact CSS class mappings
const MENU_ITEMS = [
  {
    id: 'bookmarks',
    icon: <BookmarkIcon />,
    text: '북마크',
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
    text: '프로필',
    route: '/profile-edit',
    className: styles.group11,
    vectorSrc: '/vector-2525.svg',
    directionLeftClass: styles.directionLeft2,
    textClass: styles.textWrapper6,
    groupClass: styles.group9,
    innerGroupClass: styles.group10
  },
  {
    id: 'myPlaces',
    icon: <MyPlacesIcon />,
    text: '내 장소',
    route: '/my-places',
    className: styles.group11_5,
    vectorSrc: '/vector-2525.svg',
    directionLeftClass: styles.directionLeft2,
    textClass: styles.textWrapper6,
    groupClass: styles.group9,
    innerGroupClass: styles.group10
  },
  {
    id: 'recentPlaces',
    icon: <RecentPlacesIcon />,
    text: '최근 본 장소',
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
    text: '버전 정보',
    route: null,
    className: styles.group14,
    vectorSrc: '/vector-2529.svg',
    directionLeftClass: '',
    textClass: styles.textWrapper8,
    groupClass: styles.group15,
    innerGroupClass: styles.group16,
    showArrow: false
  }
];


export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { isGuest } = useAuthGuard(true); // This page requires authentication
  const [profile, setProfile] = useState(null);
  const [myPlacesCount, setMyPlacesCount] = useState(0);
  const userDescription = profile?.mbti ? `${profile.mbti} 취향의 이용자입니다.` : '취향 정보를 설정해보세요.';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileResponse, myPlacesResponse] = await Promise.all([
          userService.getProfile(),
          activityService.getMyPlaces()
        ]);

        if (profileResponse.success) {
          setProfile(profileResponse.data?.user);
        }

        if (myPlacesResponse.success) {
          const places = myPlacesResponse.data?.places;
          setMyPlacesCount(Array.isArray(places) ? places.length : 0);
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    if (!isGuest) {
      loadData();
    }
  }, [isGuest]);

  const handleMenuItemClick = (item) => {
    if (item.route) {
      navigate(item.route);
    } else {
      console.log(`Navigate to ${item.text}`);
    }
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
          userName={profile?.nickname || '이용자'}
          mbtiValue={profile?.mbti || '----'}
          placesCount={myPlacesCount}
          userDescription={userDescription}
          profileImage={profile?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'}
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
              <h3 className={styles.moodTitle}>지금 뭐하지?</h3>
              <p className={styles.moodDescription}>
                시간, 기분, 취향을 반영해서<br />
                당신에게 어울리는 곳을 골라봤어요.
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
