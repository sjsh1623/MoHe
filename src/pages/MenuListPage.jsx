import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from '@/styles/pages/menu-list-page.module.css';
import { placeService } from '@/services/apiService';
import { buildImageUrl } from '@/utils/image';
import MenuFullscreenModal from '@/components/ui/modals/MenuFullscreenModal';

export default function MenuListPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [menus, setMenus] = useState([]);
  const [placeName, setPlaceName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get preloaded data from navigation state
  const preloadedMenus = location.state?.menus || [];
  const preloadedPlaceName = location.state?.placeName || '';

  useEffect(() => {
    const loadMenus = async () => {
      try {
        setIsLoading(true);

        // Use preloaded data if available
        if (preloadedMenus.length > 0) {
          setMenus(preloadedMenus.filter(menu => menu.imagePath));
          setPlaceName(preloadedPlaceName);
          setIsLoading(false);
          return;
        }

        // Otherwise fetch from API
        const [menusResponse, placeResponse] = await Promise.all([
          placeService.getPlaceMenus(id),
          placeService.getPlaceById(id)
        ]);

        if (menusResponse.success && menusResponse.data) {
          const menusWithImages = (menusResponse.data.menus || []).filter(menu => menu.imagePath);
          setMenus(menusWithImages);
        }

        if (placeResponse.success && placeResponse.data?.place) {
          setPlaceName(placeResponse.data.place.name || placeResponse.data.place.title || '');
        }
      } catch (err) {
        console.error('Failed to load menus:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenus();
  }, [id, preloadedMenus, preloadedPlaceName]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleMenuClick = (index) => {
    setSelectedMenuIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMenuIndex(-1);
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#1B1E28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className={styles.headerTitle}>메뉴</h1>
          <div className={styles.headerSpacer} />
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#1B1E28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className={styles.headerCenter}>
          <h1 className={styles.headerTitle}>메뉴</h1>
          {placeName && <p className={styles.placeName}>{placeName}</p>}
        </div>
        <div className={styles.headerSpacer} />
      </div>

      {/* Menu Count */}
      <div className={styles.menuCount}>
        총 {menus.length}개
      </div>

      {/* Menu List */}
      <div className={styles.menuList}>
        {menus.map((menu, index) => (
          <motion.div
            key={menu.id || index}
            className={styles.menuItem}
            onClick={() => handleMenuClick(index)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
          >
            <div className={styles.menuContent}>
              <div className={styles.menuTextContent}>
                <h3 className={styles.menuName}>{menu.name || `메뉴 ${index + 1}`}</h3>
                <p className={styles.menuPrice}>{menu.price || ''}</p>
                {menu.description && (
                  <p className={styles.menuDescription}>{menu.description}</p>
                )}
                {menu.isPopular && (
                  <span className={styles.popularBadge}>인기</span>
                )}
              </div>
              <div className={styles.menuThumbnail}>
                <img
                  src={buildImageUrl(menu.imagePath)}
                  alt={menu.name || '메뉴'}
                  className={styles.thumbnailImage}
                  draggable={false}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      <MenuFullscreenModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        menus={menus}
        initialIndex={selectedMenuIndex}
      />
    </div>
  );
}
