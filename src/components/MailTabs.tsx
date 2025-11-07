import { ReactNode } from 'react';
import MailTabButton from './MailTabButton';
import MailSection from './MailSection';
import type { EmailCounts } from '../types/emailCounts';

export type MailSectionType = 'all' | 'sent' | 'opened' | 'answered' | 'scheduled';

interface MailTabsProps {
  activeSection: MailSectionType;
  onSectionChange: (section: MailSectionType) => void;
  children: ReactNode;
  counts?: Partial<EmailCounts>;
  disabled?: boolean;
}

interface MailTabData {
  type: MailSectionType;
  label: string;
  count: number;
  isClickable: boolean;
}

export default function MailTabs({ activeSection, onSectionChange, children, counts = {}, disabled = false }: MailTabsProps) {
  const mailTabs: MailTabData[] = [
    { type: 'all', label: 'Drafts', count: counts.all || 0, isClickable: true },
    { type: 'sent', label: 'Sent', count: counts.sent || 0, isClickable: true },
    // { type: 'opened', label: 'Opened', count: counts.opened || 0, isClickable: false }, Hide for now
    { type: 'answered', label: 'Answered', count: counts.answered || 0, isClickable: true },
    { type: 'scheduled', label: 'Scheduled', count: counts.scheduled || 0, isClickable: true },
  ];
  return (
    <div className='p-[15px] h-full flex flex-col pt-0'>
      {/* Mail Tab Buttons */}
      <div className="flex flex-wrap gap-4 flex-shrink-0 border-b border-gray-200 pb-3">
        {mailTabs.map((tab) => (
          <MailTabButton
            key={tab.type}
            label={tab.label}
            count={tab.count}
            isActive={activeSection === tab.type}
            onClick={() => !disabled && onSectionChange(tab.type)}
            isClickable={tab.isClickable && !disabled}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Mail Content Sections */}
      <div className="flex-1 min-h-0">
        <MailSection section={activeSection}>
          {children}
        </MailSection>
      </div>
    </div>
  );
}
