import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '@/styles/pages/mbti-selection-page.module.css';
import PreferencePageLayout from '@/components/layout/PreferencePageLayout';
import {useUserPreferences} from '@/contexts';

// MBTI descriptions mapping
const MBTI_DESCRIPTIONS = {
    'ISFP': '하루의 분주함을 뒤로하고, 조용한 카페 구석에서 따뜻한 차 한 잔에 마음의 평온을 느끼는 순간이 큰 위로가 돼요.\n계획으로 쌓아둔 작은 즐거움이 지켜질 때의 안도감이 여행의 진정한 설렘이 되죠.\n자연의 고요함도 좋지만, 도심 골목마다 숨어 있는 예술과 이야기가 제 안의 영감을 깨워줘요.',
    'ISFJ': '따뜻한 분위기의 작은 카페에서 친구들과 나누는 소소한 이야기가 가장 큰 행복이에요.\n새로운 장소보다는 익숙하고 편안한 공간에서 마음의 안정을 찾는 편이죠.\n주변 사람들이 편안해하는 모습을 보면서 진정한 만족감을 느끼는 여행을 선호해요.',
    'INFP': '혼자만의 시간을 통해 내면의 깊은 생각을 정리하고, 예술적 영감을 얻는 공간을 찾아요.\n계획보다는 그 순간의 감정에 따라 자유롭게 움직이는 여행이 더 의미있게 느껴져요.\n사람들의 진솔한 이야기와 문화가 담긴 장소에서 깊은 울림을 경험하고 싶어해요.',
    'INFJ': '의미있는 경험과 깊은 성찰을 할 수 있는 조용하고 영감을 주는 장소를 선호해요.\n계획적이지만 유연하게, 자신만의 특별한 순간을 만들어가는 여행을 좋아해요.\n역사와 문화가 깊이 스며있는 곳에서 진정한 배움과 감동을 얻고 싶어해요.',
    'ISTP': '실용적이고 효율적인 여행을 선호하며, 직접 체험할 수 있는 활동적인 장소를 좋아해요.\n계획보다는 즉흥적으로 움직이면서 새로운 기술이나 경험을 시도하는 걸 즐겨요.\n혼자서도 충분히 즐길 수 있는 자유로운 여행 스타일을 추구해요.',
    'ISTJ': '체계적이고 안전한 여행 계획을 세우며, 검증된 명소와 전통적인 장소를 선호해요.\n미리 준비된 일정에 따라 움직이면서 안정감을 느끼는 여행을 좋아해요.\n역사적 가치와 문화적 의미가 있는 곳에서 깊이있는 학습 경험을 추구해요.',
    'INTP': '독특하고 지적 호기심을 자극하는 장소를 찾아 혼자만의 탐구 시간을 가져요.\n정해진 일정보다는 관심있는 것을 발견했을 때 깊이 파고드는 자유로운 여행을 선호해요.\n과학관, 박물관, 도서관 같은 지식을 얻을 수 있는 공간에서 특별한 영감을 받아요.',
    'INTJ': '목적이 명확하고 효율적인 여행 계획을 세우며, 개인적 성장에 도움되는 경험을 추구해요.\n혼자서 깊이 사고할 수 있는 조용한 환경과 체계적인 학습 기회를 선호해요.\n미래에 대한 비전과 통찰을 얻을 수 있는 의미있는 장소를 찾아 여행해요.',
    'ESFP': '활기찬 분위기에서 사람들과 함께 즐기는 다양한 경험과 새로운 만남을 추구해요.\n계획보다는 그 순간의 감정과 분위기에 따라 자유롭게 움직이는 여행을 좋아해요.\n맛집, 쇼핑, 엔터테인먼트가 풍부한 활동적이고 재미있는 장소를 선호해요.',
    'ESFJ': '가족이나 친구들과 함께 따뜻하고 화목한 시간을 보낼 수 있는 장소를 찾아요.\n모든 사람이 편안하고 즐거워할 수 있는 잘 계획된 여행을 선호해요.\n전통적이고 친숙한 문화 체험과 맛있는 음식을 함께 나누는 여행을 좋아해요.',
    'ENFP': '새로운 사람들과의 만남과 예상치 못한 모험을 통해 영감을 얻는 여행을 추구해요.\n자유로운 일정으로 다양한 경험을 시도하며, 창의적 영감을 주는 장소를 선호해요.\n예술, 문화, 자연이 어우러진 곳에서 깊은 감동과 새로운 아이디어를 얻고 싶어해요.',
    'ENFJ': '의미있는 만남과 문화 교류를 통해 서로에게 긍정적 영향을 주고받는 여행을 좋아해요.\n계획적이면서도 사람들이 함께 성장할 수 있는 경험을 만들어가요.\n봉사활동이나 지역사회와 연결된 의미있는 여행 활동을 선호해요.',
    'ESTP': '즉흥적이고 모험적인 활동으로 가득한 역동적인 여행을 추구해요.\n새로운 도전과 스릴을 느낄 수 있는 액티비티와 다양한 경험을 좋아해요.\n활기찬 도시나 자연에서 몸으로 직접 체험할 수 있는 모험적인 여행을 선호해요.',
    'ESTJ': '효율적이고 체계적인 계획으로 목표를 달성하는 성과있는 여행을 추구해요.\n검증된 명소와 전통적인 관광지를 방문하며 안정적인 여행을 선호해요.\n비즈니스나 네트워킹 기회가 있는 실용적이고 생산적인 여행을 좋아해요.',
    'ENTP': '새로운 아이디어와 가능성을 탐구할 수 있는 창의적이고 자극적인 여행을 추구해요.\n즉흥적으로 계획을 바꾸며 예상치 못한 경험과 만남을 즐겨요.\n혁신적인 기술이나 독특한 문화를 경험할 수 있는 최첨단 도시를 선호해요.',
    'ENTJ': '명확한 목표와 효율적인 계획으로 최대한의 성과를 얻는 여행을 추구해요.\n리더십을 발휘할 수 있는 그룹 여행이나 비즈니스 관련 활동을 선호해요.\n미래 비전에 도움되는 네트워킹과 학습 기회가 있는 전략적인 여행을 좋아해요.'
};

export default function MBTISelectionPage() {
    const navigate = useNavigate();
    const { mbtiState, updateMBTILetter, getMBTIString, isMBTIComplete } = useUserPreferences();
    
    // Animation state
    const [isUpdating, setIsUpdating] = useState(false);
    const [justCompleted, setJustCompleted] = useState(false);

    // Destructure MBTI state for easier access
    const { extroversion, sensing, thinking, judging } = mbtiState;


    const handleLetterSelect = (category, letter) => {
        // Check if MBTI was complete before this change
        const wasComplete = isMBTIComplete();
        
        // Update the letter using context
        updateMBTILetter(category, letter);
        
        // Check if MBTI becomes complete after this change
        // We need to calculate this manually since state updates are async
        let willBeComplete = false;
        const currentState = { ...mbtiState };
        switch (category) {
            case 'EI':
                currentState.extroversion = letter;
                break;
            case 'SN':
                currentState.sensing = letter;
                break;
            case 'TF':
                currentState.thinking = letter;
                break;
            case 'JP':
                currentState.judging = letter;
                break;
        }
        willBeComplete = currentState.extroversion && currentState.sensing && currentState.thinking && currentState.judging;
        
        // Trigger update animation for any change
        setIsUpdating(true);
        setTimeout(() => setIsUpdating(false), 300);
        
        // Trigger completion animation if MBTI just became complete
        if (!wasComplete && willBeComplete) {
            setJustCompleted(true);
            setTimeout(() => setJustCompleted(false), 600);
        }
    };

    const getCurrentMBTI = () => {
        return getMBTIString();
    };

    const getCurrentDescription = () => {
        const currentMBTI = getCurrentMBTI();
        if (currentMBTI.length === 4) {
            return MBTI_DESCRIPTIONS[currentMBTI] || '당신만의 독특한 성격 유형이에요! 다양한 경험을 통해 자신만의 여행 스타일을 찾아보세요.';
        }
        return '자신만의 여행 스타일을 찾아보세요';
    };

    const isReady = () => {
        return isMBTIComplete();
    };

    const handleNext = () => {
        if (!isReady()) return;
        const mbti = getCurrentMBTI();
        console.log('Selected MBTI:', mbti);
        navigate('/space-preference');
    };

    const handleSkip = () => {
        console.log('User skipped MBTI selection');
        navigate('/home');
    };

    return (
        <PreferencePageLayout
            title={<>MBTI를 알려주면,<br/>추천이 쉬워져요</>}
            subtitle="아래에서 내 MBTI를 직접 선택해보세요"
            onNext={handleNext}
            onSkip={handleSkip}
            isReady={isReady()}
            progressSteps={4}
            activeSteps={2}
            customStyles={styles}
        >
            {/* MBTI Selection Grid */}
                    <div className={styles.mbtiGrid}>
                        {/* Row 1: E/I and S/N */}
                        <div className={styles.mbtiRow}>
                            <button
                                className={`${styles.mbtiLetter} ${extroversion === 'E' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('EI', 'E')}
                            >
                                E
                            </button>
                            <button
                                className={`${styles.mbtiLetter} ${sensing === 'S' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('SN', 'S')}
                            >
                                S
                            </button>
                            <button
                                className={`${styles.mbtiLetter} ${thinking === 'T' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('TF', 'T')}
                            >
                                T
                            </button>
                            <button
                                className={`${styles.mbtiLetter} ${judging === 'P' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('JP', 'P')}
                            >
                                P
                            </button>
                        </div>

                        {/* Row 2: I and N */}
                        <div className={styles.mbtiRow}>
                            <button
                                className={`${styles.mbtiLetter} ${extroversion === 'I' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('EI', 'I')}
                            >
                                I
                            </button>
                            <button
                                className={`${styles.mbtiLetter} ${sensing === 'N' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('SN', 'N')}
                            >
                                N
                            </button>
                            <button
                                className={`${styles.mbtiLetter} ${thinking === 'F' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('TF', 'F')}
                            >
                                F
                            </button>
                            <button
                                className={`${styles.mbtiLetter} ${judging === 'J' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('JP', 'J')}
                            >
                                J
                            </button>
                        </div>
                    </div>

                    {/* MBTI Display */}
                    <div className={`${styles.mbtiDisplay} ${isUpdating ? styles.update : ''} ${justCompleted ? styles.complete : ''}`}>
                        {getCurrentMBTI()}
                    </div>

                    {/* Description */}
                    <div className={`${styles.description} ${isUpdating ? styles.fadeIn : ''}`}>
                        {getCurrentDescription()}
                    </div>
        </PreferencePageLayout>
    );
}