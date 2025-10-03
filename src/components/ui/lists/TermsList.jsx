import React from 'react';
import { Stack } from '@/components/ui/layout';
import Checkbox from '@/components/ui/inputs/Checkbox';
import styles from '@/styles/components/lists/terms-list.module.css';

export default function TermsList({ 
  agreements, 
  onAgreementChange, 
  onAllAgreeChange,
  onViewTerms 
}) {
  const allRequired = agreements.filter(term => term.required);
  const allOptional = agreements.filter(term => !term.required);
  const allChecked = agreements.every(term => term.checked);

  const handleAllAgreeChange = (checked) => {
    onAllAgreeChange(checked);
  };

  const handleIndividualChange = (id, checked) => {
    onAgreementChange(id, checked);
  };

  const handleViewTerms = (id) => {
    if (onViewTerms) {
      onViewTerms(id);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.termsWrapper}>
        {/* 전체 동의 */}
        <Checkbox
          checked={allChecked}
          onChange={handleAllAgreeChange}
          label="전체 동의"
          className={styles.allAgreeCheckbox}
        />

        {/* 개별 약관들 */}
        <div className={styles.individualTerms}>
          {agreements.map((agreement) => (
            <Checkbox
              key={agreement.id}
              checked={agreement.checked}
              onChange={(checked) => handleIndividualChange(agreement.id, checked)}
              label={agreement.label}
              showArrow={agreement.hasDetails}
              onArrowClick={() => handleViewTerms(agreement.id)}
              className="inGroup"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
