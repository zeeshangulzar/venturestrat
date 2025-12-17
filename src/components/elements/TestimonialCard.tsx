import { FC } from "react";

interface TestimonialCardProps {
  quote: string;
  avatar: string;
  name: string;
  role: string;
  amount: string;
  amountLabel?: string;
}

const TestimonialCard: FC<TestimonialCardProps> = ({
  quote,
  avatar,
  name,
  role,
  amount,
  amountLabel = "Raised",
}) => {
  return (
    <div className="flex-shrink-0">
      <div className="w-[480px] h-[400px] bg-[rgba(51,51,51,0.25)] border border-[#333333] rounded-[16px] flex flex-col justify-between p-6">

        {/* Fixed Quote Icon */}
        <div>
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
            <path
              d="M20.6453 0V3.81308H18.532C16.8703 3.81308 16.0394 4.6729 16.0394 6.39252V8.18692H16.9606C18.4056 8.18692 19.5977 8.63551 20.5369 9.53271C21.5123 10.4299 22 11.5701 22 12.9533C22 14.4486 21.5123 15.6636 20.5369 16.5981C19.5977 17.5327 18.4056 18 16.9606 18C15.4795 18 14.2693 17.5327 13.33 16.5981C12.3908 15.6262 11.9212 14.3364 11.9212 12.729V6.28037C11.9212 2.09346 13.9442 0 17.9901 0H20.6453ZM8.72414 0V3.81308H6.61084C4.9491 3.81308 4.11823 4.6729 4.11823 6.39252V8.18692H5.03941C6.4844 8.18692 7.67652 8.63551 8.61576 9.53271C9.59113 10.4299 10.0788 11.5701 10.0788 12.9533C10.0788 14.4486 9.59113 15.6636 8.61576 16.5981C7.67652 17.5327 6.4844 18 5.03941 18C3.55829 18 2.34811 17.5327 1.40887 16.5981C0.469622 15.6262 0 14.3364 0 12.729V6.28037C0 2.09346 2.02299 0 6.06897 0H8.72414Z"
              fill="#0252D6"
            />
          </svg>
        </div>

        {/* Quote */}
        <p className="font-inter font-medium text-[20px] leading-[150%] text-white flex-1 mt-4">
          {quote}
        </p>

        {/* Bottom */}
        <div className="flex items-center justify-between mt-6">

          {/* Left Side */}
          <div className="flex items-center gap-4">
            <img
              src={avatar}
              alt={name}
              className="w-[60px] h-[60px] rounded-full object-cover"
            />

            <div>
              <p className="font-inter font-medium text-[20px] leading-[150%] text-white">
                {name}
              </p>
              <p className="font-poppins font-medium text-[16px] leading-[24px] text-[#6CA2FC]">
                {role}
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="text-right">
            <p className="font-inter font-medium text-[20px] leading-[150%] text-white">
              {amount}
            </p>
            <p className="font-poppins font-medium text-[16px] leading-[24px] text-[#6CA2FC]">
              {amountLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;