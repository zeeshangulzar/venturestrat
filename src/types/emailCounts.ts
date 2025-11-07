export type EmailCountKey = 'all' | 'sent' | 'opened' | 'answered' | 'scheduled';

export type EmailCounts = Record<EmailCountKey, number>;

export type EmailCountDelta = Partial<Record<EmailCountKey, number>>;

