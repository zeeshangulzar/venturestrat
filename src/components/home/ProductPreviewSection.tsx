"use client";
import Image from "next/image";

export default function ProductPreview() {
  return (
    <section id="product" className="relative mx-auto px-6">
      {/* LEFT VECTOR */}
      <img
        src="/vector.png"
        alt=""
        className="absolute left-0 top-[105px] w-[460px] opacity-90"
      />

      {/* RIGHT VECTOR */}
      <img
        src="/vector.png"
        alt=""
        className="absolute right-0 top-[-155px] w-[460px] opacity-90"
      />

      {/* FRAME */}
      <div className="relative z-10 mx-auto max-w-5xl rounded-[32px] bg-[#F3F4F6] p-4 shadow-xl border border-[#F3F4F6]">
        <Image
          src="/desktop.png"
          alt="CRM Screenshot"
          width={2000}
          height={863}
          className="rounded-[24px] w-full"
        />
      </div>
    </section>
  );
}
