import { ReactNode } from 'react';

type MailSectionType = 'all' | 'sent' | 'opened' | 'answered';

interface MailSectionProps {
  section: MailSectionType;
  children: ReactNode;
}

export default function MailSection({ section, children }: MailSectionProps) {
  const getSectionTitle = (section: MailSectionType) => {
    switch (section) {
      case 'all':
        return 'All Mails';
      case 'sent':
        return 'Sent Mails';
      case 'opened':
        return 'Opened Mails';
      case 'answered':
        return 'Answered Mails';
      default:
        return 'Mails';
    }
  };

  return (
    <div className="mt-4">
      {children}
    </div>
  );
}
