import React from 'react';
import PropTypes from 'prop-types';
import styles from '@/styles/components/home/home-section.module.css';

export default function HomeSection({
  title,
  description,
  actionSlot,
  footer,
  paddedBody = true,
  children,
  className = '',
}) {
  return (
    <section className={`${styles.section} ${className}`}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>{title}</h2>
        {actionSlot ? <div className={styles.actionSlot}>{actionSlot}</div> : null}
      </div>
      {description ? (
        <p className={styles.description}>{description}</p>
      ) : null}
      <div className={paddedBody ? styles.body : styles.bodyUnpadded}>
        {children}
      </div>
      {footer ? (
        <div className={styles.footer}>
          {footer}
        </div>
      ) : null}
    </section>
  );
}

HomeSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actionSlot: PropTypes.node,
  footer: PropTypes.node,
  paddedBody: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
