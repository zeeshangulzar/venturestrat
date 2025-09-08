import { ReactNode } from 'react';
import MailTabButton from './MailTabButton';
import MailSection from './MailSection';

export type MailSectionType = 'all' | 'sent' | 'opened' | 'answered';

interface MailTabsProps {
  activeSection: MailSectionType;
  onSectionChange: (section: MailSectionType) => void;
  children: ReactNode;
}

interface MailTabData {
  type: MailSectionType;
  label: string;
  count: number;
  isClickable: boolean;
}

const mailTabs: MailTabData[] = [
  { type: 'all', label: 'All Mails', count: 0, isClickable: true },
  { type: 'sent', label: 'Sent', count: 0, isClickable: true },
  { type: 'opened', label: 'Opened', count: 0, isClickable: false },
  { type: 'answered', label: 'Answered', count: 0, isClickable: false },
];

export default function MailTabs({ activeSection, onSectionChange, children }: MailTabsProps) {
  return (
    <div>
      {/* Mail Tab Buttons */}
      <div className="mt-4 flex flex-wrap gap-4">
        {mailTabs.map((tab) => (
          <MailTabButton
            key={tab.type}
            label={tab.label}
            count={tab.count}
            isActive={activeSection === tab.type}
            onClick={() => onSectionChange(tab.type)}
            isClickable={tab.isClickable}
          />
        ))}
      </div>

      {/* Mail Content Sections */}
      <MailSection section={activeSection}>
        {children}
      </MailSection>
    </div>
  );
}
