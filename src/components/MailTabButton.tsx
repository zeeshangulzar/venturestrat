interface MailTabButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  isClickable?: boolean;
}

export default function MailTabButton({ 
  label, 
  count, 
  isActive, 
  onClick, 
  isClickable = true 
}: MailTabButtonProps) {
  return (
    <div 
      className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
        isActive 
          ? 'bg-[#2563EB] text-white' 
          : 'bg-[#F6F6F7] text-[#0C2143]'
      } ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
      onClick={isClickable ? onClick : undefined}
    >
      <span className="font-semibold text-[14px] leading-4 tracking-[-0.02em] capitalize">
        {label}
      </span>
      <span className={`rounded-full px-2 py-0.5 text-sm font-semibold ${
        isActive 
          ? 'bg-white text-[#2563EB]' 
          : 'bg-white text-[#0C2143]'
      }`}>
        {count}
      </span>
    </div>
  );
}
