

export default function SocialCard()  {
 return (
    <div className="bg-white border border-[#3333331A] shadow-[6px_8px_15px_2px_rgba(0,0,0,0.06)] rounded-[8px] w-[453px] p-4">
      <p className="font-onest font-bold text-[18px] leading-[24px] tracking-[-0.02em] text-[#0C2143] text-start">Create Post</p>
      <p className="text-start font-onest font-semibold text-[16px] leading-[24px] tracking-[-0.02em] text-[#0C2143] capitalize mb-3">Social Media Channel Option</p>
      <img src="/social-icons.png" alt="" className="mb-4" />
      <div className="border border-[#EDEEEF] round-[14px]"></div>
      <p className="font-onest font-bold text-[18px] leading-[24px] tracking-[-0.02em] text-[#0C2143] text-start mt-3 mb-3">Quick Choices</p>
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <img src="/ig-post.png" alt="instagaram" className="w-[132px] h-[180px]" />
          <p className="font-onest font-semibold text-[14px] leading-[24px] tracking-[-0.02em] text-[#0C2143] text-center capitalize">IG Post</p>
        </div>
        <div className="flex flex-col items-center">
          <img src="/ticktock.png" alt="ticktop" className="w-[132px] h-[180px]" />
          <p className="font-onest font-semibold text-[14px] leading-[24px] tracking-[-0.02em] text-[#0C2143] text-center capitalize">IG TikTok Thumbnail</p>
        </div>
        <div className="flex flex-col items-center">
          <img src="/tiktok.png" alt="tiktok" className="w-[132px] h-[180px]" />
          <p className="font-onest font-semibold text-[14px] leading-[24px] tracking-[-0.02em] text-[#0C2143] text-center capitalize">TikTok Script</p>
        </div>
      </div>
    </div>
  );
}