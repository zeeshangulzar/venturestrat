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
      <h3 className="text-lg font-semibold text-[#0C2143] mb-4">
        {getSectionTitle(section)}
      </h3>
      {children}
    </div>
  );
}
