import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/profile-settings-page.module.css';
import BackButton from '@/components/ui/buttons/BackButton';

export default function ProfileSettingsPage() {
  const navigate = useNavigate();

  const handleBookmarksClick = () => {
    navigate('/bookmarks');
  };

  const handleProfileClick = () => {
    console.log('Navigate to profile edit');
    navigate('/profile-edit');
  };

  const handleRecentPlacesClick = () => {
    console.log('Navigate to recent places');
  };

  const handleVersionInfoClick = () => {
    console.log('Show version info');
  };

  return (
    <div className={styles.iphoneProMax}>
      <div className={styles.div}>
        {/* Header */}
        <header className={styles.header}>
          <BackButton />
        </header>
        
        <div className={styles.group}>
          <div className={styles.groupWrapper}>
            <div className={styles.group2}>
              <img className={styles.rectangle} src="/rectangle-841.svg" alt="" />
              <div className={styles.group3}>
                <div className={styles.textWrapper}>MBTI</div>
                <div className={styles.textWrapper2}>INFJ</div>
              </div>
              <div className={styles.group4}>
                <div className={styles.textWrapper3}>내 장소</div>
                <div className={styles.textWrapper4}>5</div>
              </div>
            </div>
          </div>
          <div className={styles.group5}>
            <div className={styles.group6}>
              <div className={styles.textWrapper5}>석현</div>
              <p className={styles.p}>함께 조용히 머무를 수 있는 곳을 좋아해요</p>
            </div>
            <img className={styles.img} src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" alt="프로필" />
          </div>
        </div>

        <div className={styles.overlap}>
          <div className={styles.divWrapper}>
            <div className={styles.group7}>
              <div className={styles.group8} onClick={handleBookmarksClick}>
                <img className={styles.vector} src="/vector-2526.svg" alt="" />
                <div className={styles.group9}>
                  <div className={styles.backArrow}>
                    <div className={styles.directionLeft}></div>
                  </div>
                  <div className={styles.group10}>
                    <div className={styles.leftContent}>
                      <div className={styles.version}>
                        <svg width="26" height="26" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6.77325 8.32544C6.77325 6.66858 8.1164 5.32544 9.77325 5.32544H17.7696C19.4264 5.32544 20.7696 6.66858 20.7696 8.32544V22.104C20.7696 23.0066 19.6683 23.4473 19.0456 22.7939L15.2193 18.7785C14.4312 17.9515 13.1116 17.9515 12.3235 18.7785L8.49719 22.7939C7.87454 23.4473 6.77325 23.0066 6.77325 22.104V8.32544Z" stroke="#7D848D" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className={styles.textWrapper6}>북마크</div>
                    </div>
                    <div className={styles.rightArrow}>
                      <svg width="24" height="24" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M11.0758 7.48913C10.7263 7.78256 10.6696 8.31775 10.9492 8.68453L14.8666 13.8231L10.9492 18.9617C10.6696 19.3284 10.7263 19.8636 11.0758 20.1571C11.4253 20.4505 11.9353 20.391 12.2149 20.0242L16.5373 14.3544C16.7741 14.0438 16.7741 13.6024 16.5373 13.2918L12.2149 7.62195C11.9353 7.25518 11.4253 7.19571 11.0758 7.48913Z" fill="#7D848D"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.group11} onClick={handleProfileClick}>
                <img className={styles.vector} src="/vector-2525.svg" alt="" />
                <div className={styles.group9}>
                  <div className={styles.backArrow}>
                    <div className={styles.directionLeft2}></div>
                  </div>
                  <div className={styles.group10}>
                    <div className={styles.leftContent}>
                      <div className={styles.version}>
                        <svg width="26" height="26" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <ellipse cx="13.2567" cy="20.0597" rx="7.56418" ry="3.9689" stroke="#7D848D" strokeWidth="1.5" strokeLinejoin="round"/>
                          <ellipse cx="13.2567" cy="8.15307" rx="4.32239" ry="4.53589" stroke="#7D848D" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className={styles.textWrapper6}>프로필</div>
                    </div>
                    <div className={styles.rightArrow}>
                      <svg width="24" height="24" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M11.0758 7.48913C10.7263 7.78256 10.6696 8.31775 10.9492 8.68453L14.8666 13.8231L10.9492 18.9617C10.6696 19.3284 10.7263 19.8636 11.0758 20.1571C11.4253 20.4505 11.9353 20.391 12.2149 20.0242L16.5373 14.3544C16.7741 14.0438 16.7741 13.6024 16.5373 13.2918L12.2149 7.62195C11.9353 7.25518 11.4253 7.19571 11.0758 7.48913Z" fill="#7D848D"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.group12} onClick={handleRecentPlacesClick}>
                <img className={styles.vector} src="/vector-2529-2.svg" alt="" />
                <div className={styles.group9}>
                  <div className={styles.backArrow}>
                    <div className={styles.directionLeft3}></div>
                  </div>
                  <div className={styles.group13}>
                    <div className={styles.leftContent}>
                      <div className={styles.version}>
                        <svg width="26" height="26" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21.9015 13.4041C21.9015 8.08014 17.7898 3.76538 12.7164 3.76538C7.64301 3.76538 3.53134 8.08014 3.53134 13.4041C3.53134 18.7281 7.64301 23.0429 12.7164 23.0429" stroke="#7D848D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21.1127 22.2151L22.9821 24.1769" stroke="#7D848D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21.1103 18.2034C22.1653 19.3105 22.1653 21.1055 21.1103 22.2126C20.0553 23.3197 18.3448 23.3197 17.2898 22.2126C16.2348 21.1055 16.2348 19.3105 17.2898 18.2034C18.3448 17.0963 20.0553 17.0963 21.1103 18.2034" stroke="#7D848D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4.48984 17.6918H4.55251C7.61384 17.6918 9.65509 17.5081 9.65509 14.4793C9.65509 11.2668 12.7164 11.2668 12.7164 9.12468C12.7164 6.72973 8.63393 6.98261 8.63393 4.84054V4.76343" stroke="#7D848D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21.9015 13.4041H18.5862C16.3116 13.4041 15.1045 10.5839 16.6152 8.79905L18.8099 6.20679" stroke="#7D848D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className={styles.textWrapper7}>최근 본 장소</div>
                    </div>
                    <div className={styles.rightArrow}>
                      <svg width="24" height="24" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M11.0758 7.48913C10.7263 7.78256 10.6696 8.31775 10.9492 8.68453L14.8666 13.8231L10.9492 18.9617C10.6696 19.3284 10.7263 19.8636 11.0758 20.1571C11.4253 20.4505 11.9353 20.391 12.2149 20.0242L16.5373 14.3544C16.7741 14.0438 16.7741 13.6024 16.5373 13.2918L12.2149 7.62195C11.9353 7.25518 11.4253 7.19571 11.0758 7.48913Z" fill="#7D848D"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.group14} onClick={handleVersionInfoClick}>
                <img className={styles.vector} src="/vector-2529.svg" alt="" />
                <div className={styles.group15}>
                  <div className={styles.group16}>
                    <div className={styles.version}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.37988 12.0001L10.7899 14.4201L15.6199 9.58008" stroke="#7D848D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.7499 2.45007C11.4399 1.86007 12.5699 1.86007 13.2699 2.45007L14.8499 3.81007C15.1499 4.07007 15.7099 4.28007 16.1099 4.28007H17.8099C18.8699 4.28007 19.7399 5.15007 19.7399 6.21007V7.91007C19.7399 8.30007 19.9499 8.87007 20.2099 9.17007L21.5699 10.7501C22.1599 11.4401 22.1599 12.5701 21.5699 13.2701L20.2099 14.8501C19.9499 15.1501 19.7399 15.7101 19.7399 16.1101V17.8101C19.7399 18.8701 18.8699 19.7401 17.8099 19.7401H16.1099C15.7199 19.7401 15.1499 19.9501 14.8499 20.2101L13.2699 21.5701C12.5799 22.1601 11.4499 22.1601 10.7499 21.5701L9.16988 20.2101C8.86988 19.9501 8.30988 19.7401 7.90988 19.7401H6.17988C5.11988 19.7401 4.24988 18.8701 4.24988 17.8101V16.1001C4.24988 15.7101 4.03988 15.1501 3.78988 14.8501L2.43988 13.2601C1.85988 12.5701 1.85988 11.4501 2.43988 10.7601L3.78988 9.17007C4.03988 8.87007 4.24988 8.31007 4.24988 7.92007V6.20007C4.24988 5.14007 5.11988 4.27007 6.17988 4.27007H7.90988C8.29988 4.27007 8.86988 4.06007 9.16988 3.80007L10.7499 2.45007Z" stroke="#7D848D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className={styles.textWrapper8}>버전 정보</div>
                  </div>
                </div>
              </div>
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