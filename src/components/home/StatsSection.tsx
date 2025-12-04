"use client";
import LogoDivider from "@components/elements/Divider";
import LuminaIcon from "@components/icons/LuminaIcon";
import VortexIcon from "@components/icons/VortexIcon";
import VelocityIcon from "@components/icons/VelocityIcon";
import SynergyIcon from "@components/icons/SynergyIcon";
import EnigmaIcon from "@components/icons/EnigmaIcon";
import SpectrumIcon from "@components/icons/SpectrumIcon";
import { motion } from "framer-motion";

export default function StatsSection() {
  const logos = [
    { name: "Lumina", icon: LuminaIcon },
    { name: "Vortex", icon: VortexIcon },
    { name: "Velocity", icon: VelocityIcon },
    { name: "Synergy", icon: SynergyIcon },
    { name: "Enigma", icon: EnigmaIcon },
    { name: "Spectrum", icon: SpectrumIcon },
  ];


  return (
    <section id="stats" className="max-w-7xl mx-auto relative">
      {/* Background Gradient Box */}
      <div className="relative rounded-[24px] bg-gradient-to-r from-[#0252D6] to-[#012B70] text-white px-10 py-16">

        {/* TOP TEXT */}
        <p className="text-start font-inter text-[20px] leading-[30px] text-white/65">
          Trusted by 50,000+ businesses for innovative design and growth.
        </p>

        {/* LOGOS ROW */}
        <div className="overflow-hidden w-[900px] mt-8 fade-mask">
          <motion.div
            className="flex items-center gap-12"
            animate={{ x: ["0%", "-100%"] }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {[...logos, ...logos].map((item, index) => (
              <div key={index} className="flex items-center gap-4 opacity-90">
                <item.icon className="w-6 h-6" />
                <span className="font-medium text-[18px] text-white">
                  {item.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mt-14 text-start">

          <div>
            <h2 className="font-poppins text-[48px] leading-[106px] tracking-[-0.05em] font-medium">
              120,000+
            </h2>
            <p className="font-inter text-[20px] text-white/65 leading-[30px]">
              Investors in database
            </p>
          </div>

          <div>
            <h2 className="font-poppins text-[48px] leading-[106px] tracking-[-0.05em] font-medium">
              1,100+
            </h2>
            <p className="font-inter text-[20px] text-white/65 leading-[30px]">
              Founders raising smarter
            </p>
          </div>

          <div>
            <h2 className="font-poppins text-[48px] leading-[106px] tracking-[-0.05em] font-medium">
              3,500+
            </h2>
            <p className="font-inter text-[20px] text-white/65 leading-[30px]">
              Meetings booked
            </p>
          </div>

        </div>

        {/* BUSINESSMAN IMAGE ON RIGHT */}
        <img
          src="/businessman.png"
          alt="Businessman"
          className="absolute right-0 z-10 bottom-0 h-[420px] md:h-[520px] object-contain"
        />
      </div>
    </section>
  );
}
