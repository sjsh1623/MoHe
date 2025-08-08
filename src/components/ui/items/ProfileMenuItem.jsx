import React from 'react';
import PropTypes from 'prop-types';

// Extracted right arrow component
const RightArrow = () => (
  <svg width="24" height="24" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M11.0758 7.48913C10.7263 7.78256 10.6696 8.31775 10.9492 8.68453L14.8666 13.8231L10.9492 18.9617C10.6696 19.3284 10.7263 19.8636 11.0758 20.1571C11.4253 20.4505 11.9353 20.391 12.2149 20.0242L16.5373 14.3544C16.7741 14.0438 16.7741 13.6024 16.5373 13.2918L12.2149 7.62195C11.9353 7.25518 11.4253 7.19571 11.0758 7.48913Z" fill="#7D848D"/>
  </svg>
);

export default function ProfileMenuItem({
  className,
  onClick,
  vectorSrc,
  icon,
  text,
  showArrow = true,
  directionLeftClass,
  textClass,
  groupClass,
  innerGroupClass,
  styles
}) {
  return (
    <div className={className} onClick={onClick}>
      <img className={styles?.vector || 'vector'} src={vectorSrc} alt="" />
      <div className={groupClass}>
        <div className={styles?.backArrow || 'backArrow'}>
          <div className={directionLeftClass}></div>
        </div>
        <div className={innerGroupClass}>
          <div className={styles?.leftContent || 'leftContent'}>
            <div className={styles?.version || 'version'}>
              {icon}
            </div>
            <div className={textClass}>{text}</div>
          </div>
          {showArrow && (
            <div className={styles?.rightArrow || 'rightArrow'}>
              <RightArrow />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ProfileMenuItem.propTypes = {
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  vectorSrc: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  showArrow: PropTypes.bool,
  directionLeftClass: PropTypes.string.isRequired,
  textClass: PropTypes.string.isRequired,
  groupClass: PropTypes.string,
  innerGroupClass: PropTypes.string,
  styles: PropTypes.object
};