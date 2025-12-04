// components/QuestionAnswer.tsx

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function QuestionAnswer() {
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger only once
    threshold: 0.1, // When 10% of the element is in view
  });

  return (
    <section
      id="question-answer"
      className="rounded-[24px] bg-gradient-to-b text-white py-16 mx-10" 
      style={{ background: "linear-gradient(180deg, #012B70 0%, #000000 100%)"}}
      ref={ref}
    >
      <motion.div
        className="container mx-auto px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: inView ? 1 : 0 }} // Fade in when in view
        transition={{ duration: 1 }}
      >
        <h2 className="text-6xl font-medium text-center tracking-[-0.05em] text-white">
          Raise smarter with AI that
        </h2>
        <h2 className="text-6xl font-medium text-center mb-8 leading-[106px] tracking-[-0.05em] text-white"> 
          does the heavy lifting
        </h2>


        {/* Problem Section */}
        <div className="mb-12 bg-opacity-25 rounded-xl border border-red">
          <h3 className="text-xl font-semibold text-[#F97316]">Problem</h3>
          <p className="text-lg mt-4">
            Fundraising shouldn't feel like throwing darts in the dark.
          </p>
          <ul className="list-disc ml-8 mt-4 text-lg">
            <li>Googling investors for hours hoping to find someone relevant</li>
            <li>Sending generic cold emails that get ignored</li>
            <li>Chasing down investors who were never a good fit anyway</li>
            <li>Losing track of who you've contacted and where things stand</li>
            <li>Getting ghosted with no idea why</li>
          </ul>
        </div>

        {/* Solution Section */}
        <div>
          <h3 className="text-xl font-semibold text-[#16F973]">Solution</h3>
          <p className="text-lg mt-4">
            Find the right Investors with VentureStrat AI. Our AI-powered outreach gets replies and automates your entire fundraising pipeline.
          </p>
          <ul className="list-disc ml-8 mt-4 text-lg">
            <li>Actually fund your sector</li>
            <li>Invest in your region</li>
            <li>Write checks at your stage</li>
            <li>Have funded similar companies</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-lg">
            Stay organized. Stay focused. Close faster.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
