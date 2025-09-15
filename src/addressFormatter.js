/**
 * 주소를 "구 동" 형태로 포맷팅하는 유틸리티
 * @param {string} fullAddress - 전체 주소 (예: "서울특별시 강남구 도곡동 123-45")
 * @returns {string} - 포맷된 주소 (예: "강남구 도곡동")
 */
export const formatLocationForDisplay = (fullAddress) => {
  if (!fullAddress || typeof fullAddress !== 'string' || fullAddress.trim() === '') {
    return '';
  }

  const parts = fullAddress.trim().split(/\s+/);
  const result = [];

  // 구/시와 동/면/읍 찾기 (시를 구보다 우선)
  let gu = null;
  let dong = null;

  for (const part of parts) {
    if (part.endsWith('시') && !part.endsWith('특별시') && !part.endsWith('광역시')) {
      gu = part; // 일반 시만 사용 (특별시, 광역시 제외)
    } else if (part.endsWith('구') && !gu) {
      gu = part; // 구는 시가 없을 때만 사용
    } else if (part.endsWith('동') || part.endsWith('면') || part.endsWith('읍')) {
      dong = part;
      break; // 첫 번째 동을 찾으면 중단
    }
  }

  // 구/시 추가
  if (gu) {
    result.push(gu);
  }

  // 동/면/읍 추가
  if (dong) {
    result.push(dong);
  }

  // 적절한 형태를 찾지 못한 경우, 의미있는 첫 번째 두 부분 반환
  if (result.length === 0 && parts.length >= 2) {
    for (let i = 0; i < Math.min(3, parts.length) && result.length < 2; i++) {
      const part = parts[i];
      // 광역시/도 단위는 제외
      if (!part.endsWith('특별시') && !part.endsWith('광역시') && !part.endsWith('도')) {
        result.push(part);
      }
    }
  }

  return result.join(' ');
};

/**
 * 여러 장소의 location을 일괄 포맷팅
 * @param {Array} places - 장소 배열
 * @returns {Array} - location이 포맷팅된 장소 배열
 */
export const formatPlacesLocation = (places) => {
  if (!Array.isArray(places)) {
    return [];
  }

  return places.map(place => ({
    ...place,
    location: formatLocationForDisplay(place.location || place.address)
  }));
};

// 테스트용 예시
// console.log(formatLocationForDisplay("서울특별시 강남구 도곡동")); // "강남구 도곡동"
// console.log(formatLocationForDisplay("경기도 용인시 수지구 보정동")); // "용인시 보정동"
// console.log(formatLocationForDisplay("부산광역시 해운대구 우동")); // "해운대구 우동"
