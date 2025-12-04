export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-7xl mx-auto py-16 text-center flex justify-center flex-col items-center px-6 mt-40">
      <div className="bg-[rgba(2,_82,_214,_0.1)] border-[1.5px] border-[#0252D6] backdrop-blur-[2px] rounded-[90px] w-[195px] h-[49px] flex items-center justify-center">
        <p className="font-poppins font-medium text-[24px] leading-[36px] text-center text-[#0252D6]">
          How It Works
        </p>
      </div>
      <h2 className="text-4xl font-bold mb-8">From zero to pitch-ready in 3 simple steps</h2>
      <div className="container mx-auto flex justify-center gap-8">
        {/* Step 1 */}
        <div className="flex flex-col items-center bg-white border border-blue-500 rounded-xl p-8 w-1/3">
          <div className="bg-blue-50 rounded-full p-4 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-blue-500"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 2v20M5 12l7 7 7-7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold mb-2">Tell us about your startup</h3>
          <p className="text-gray-500 mb-6">
            Complete your profile in 5 minutes. Tell us your sector, stage, location, and what you’re raising.
          </p>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center bg-blue-50 border border-blue-500 rounded-xl p-8 w-1/3">
          <div className="bg-blue-100 rounded-full p-4 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-blue-500"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 2v20M5 12l7 7 7-7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold mb-2">Get matched with the right investors</h3>
          <p className="text-gray-500 mb-6">
            Explore 120,000+ investors and find the best fit based on their location, investment thesis, portfolio
            companies, and preferred stages.
          </p>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center bg-white border border-blue-500 rounded-xl p-8 w-1/3">
          <div className="bg-blue-50 rounded-full p-4 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-blue-500"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 2v20M5 12l7 7 7-7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold mb-2">Reach out</h3>
          <p className="text-gray-500 mb-6">
            Use AI to draft outreach emails that mention their portfolio and why your startup fits their thesis. Send
            directly from VentureStrat, track opens and replies, and move forward.
          </p>
        </div>
      </div>

      {/* Footer Text */}
      <div className="mt-8 text-center">
        <p className="text-lg">If they don’t respond? We automatically send follow-ups.</p>
      </div>

      {/* CTA Button */}
      <div className="text-center mt-6">
        <a
          href="#"
          className="bg-blue-500 text-white py-2 px-6 rounded-full text-lg font-semibold"
        >
          Start your free trial
        </a>
      </div>
    </section>
  );
}
