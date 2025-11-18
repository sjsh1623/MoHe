import React from 'react';
import PropTypes from 'prop-types';
import { Container, Stack } from '@/components/ui/layout';

/**
 * Reusable container wrapper for auth pages
 * Preserves individual page styles while providing consistent structure
 */
export default function AuthContainer({ 
  children, 
  pageClassName,
  contentClassName = '',
  spacing = "md"
}) {
  return (
    <Container className={pageClassName}>
      <Stack spacing={spacing} className={contentClassName}>
        {children}
      </Stack>
    </Container>
  );
}

AuthContainer.propTypes = {
  children: PropTypes.node.isRequired,
  pageClassName: PropTypes.string.isRequired,
  contentClassName: PropTypes.string,
  spacing: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl'])
};
