

export default function InvestorCard()  {
 return (
    <div className="w-[374px] text-start bg-white border border-[#3333331A] shadow-[0px_8px_15px_2px_rgba(0,0,0,0.06)] rounded-[8px]">
      <div
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
      >
        <div className="mb-3">
          <div className="flex w-full">
            <div className='w-1/2 flex flex-col justify-start pr-3 overflow-hidden'>
              <div className="font-manrope font-normal text-sm leading-[24px] tracking-[-0.02em] text-[#787F89]">Investor Name</div>
              <h4 className="font-manrope font-semibold text-base leading-[24px] tracking-normal text-[#0C2143]">
                Sam McLeod Dee
              </h4>
            </div>
            <div className='w-1/2 flex flex-col justify-start pl-3 overflow-hidden'>
              <div className="flex items-center justify-between font-manrope font-normal text-sm leading-[24px] tracking-[-0.02em] text-[#787F89]">Email Address
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex items-center gap-1 w-full min-w-0">
                <div className="font-manrope font-semibold text-base leading-[24px] tracking-normal text-[#0C2143]">
                  saam@greylock.com
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex w-full">
            <div className='w-1/2 flex flex-col justify-start pr-3 overflow-hidden'>
              <div className="font-manrope font-normal text-sm leading-[24px] tracking-[-0.02em] text-[#787F89]">Position</div>
                <div className="font-manrope font-semibold text-base leading-[24px] tracking-normal text-[#0C2143]">
                  CO - Founder
                </div>
            </div>
            <div className='w-1/2 flex flex-col justify-start pl-3 overflow-hidden'>
              <div className="font-manrope font-normal text-sm leading-[24px] tracking-[-0.02em] text-[#787F89]">Location</div>
              <div className="font-manrope font-semibold text-base leading-[24px] tracking-normal text-[#0C2143]">
                New York, USA
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button className="gap-1 w-[165px] h-[39px] bg-[#F6F6F7] rounded-[10px] text-[#2563EB]">Contact</button>
          <button className="gap-1 w-[165px] h-[39px] bg-[rgba(44,_234,_168,_0.2)] rounded-[10px] text-[#14815B]">Interested</button>
        </div>
      </div>
    </div>
  );
}