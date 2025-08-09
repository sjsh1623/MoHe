import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable title component for auth pages
 * Uses the page's individual styles while providing consistent structure
 */
export default function AuthTitle({ 
  title, 
  subtitle, 
  titleClassName = '', 
  subtitleClassName = '',
  wrapperClassName = ''
}) {
  if (!title) return null;

  return (
    <div className={wrapperClassName}>
      <h1 className={titleClassName}>
        {title}
      </h1>
      {subtitle && (
        <p className={subtitleClassName}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

AuthTitle.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  titleClassName: PropTypes.string,
  subtitleClassName: PropTypes.string,
  wrapperClassName: PropTypes.string
};