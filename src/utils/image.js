const IMAGE_BASE_URL = 'http://100.99.236.50:5200/image/';
const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

export const buildImageUrl = (path) => {
  if (!path || typeof path !== 'string') {
    return '';
  }

  const trimmed = path.trim();
  if (!trimmed) {
    return '';
  }

  if (ABSOLUTE_URL_REGEX.test(trimmed)) {
    return trimmed;
  }

  const withoutLeadingSlashes = trimmed.replace(/^\/+/, '');
  const withoutImagesPrefix = withoutLeadingSlashes.replace(/^(images?|Images?)\//, '');

  return `${IMAGE_BASE_URL}${withoutImagesPrefix}`;
};

export const buildImageUrlList = (paths = []) => {
  if (!Array.isArray(paths)) {
    return [];
  }

  const seen = new Set();
  const resolved = [];

  paths.forEach((path) => {
    const url = buildImageUrl(path);
    if (url && !seen.has(url)) {
      seen.add(url);
      resolved.push(url);
    }
  });

  return resolved;
};

export const normalizePlaceImages = (place = {}) => {
  if (!place || typeof place !== 'object') {
    return place;
  }

  const gallerySources = [];
  if (Array.isArray(place.images)) {
    gallerySources.push(...place.images);
  }
  if (Array.isArray(place.gallery)) {
    gallerySources.push(...place.gallery);
  }

  const normalizedGallery = buildImageUrlList(gallerySources);
  const primaryImage = buildImageUrl(
    place.image || place.imageUrl || normalizedGallery[0] || ''
  );

  const resolvedImages = normalizedGallery.length
    ? normalizedGallery
    : primaryImage
      ? [primaryImage]
      : [];

  return {
    ...place,
    image: primaryImage || '',
    imageUrl: primaryImage || '',
    images: resolvedImages,
    gallery: normalizedGallery.length ? normalizedGallery : place.gallery
  };
};

export { IMAGE_BASE_URL };
