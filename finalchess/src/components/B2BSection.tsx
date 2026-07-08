import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  DollarSign,
  Play,
  Settings,
  Users,
  Youtube,
} from "lucide-react";

const stats = [
  ["Total Subscribers", "145,231", "+12.5%"],
  ["Monthly Revenue", "$24,560", "+18.3%"],
  ["Total Views", "3.2M", "+9.7%"],
];

const bars = [30, 42, 34, 58, 48, 72, 86];

export function B2BSection() {
  return (
    <section id="b2b" className="relative w-full overflow-hidden py-20 lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#707cff]/70 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_42%,rgba(112,124,255,0.22),transparent_34%),radial-gradient(circle_at_58%_60%,rgba(34,211,238,0.12),transparent_28%)] pointer-events-none" />
      <div className="absolute right-0 top-20 h-80 w-1/2 bg-[#707cff]/10 blur-[90px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="relative z-10 space-y-7 order-2 lg:order-1"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold font-display leading-tight tracking-tight">
            Build More Than <br />
            <span className="bg-gradient-to-r from-[#58a6ff] via-[#8492ff] to-[#d36bff] bg-clip-text text-transparent text-glow-blue">
              Subscribers
            </span>
          </h2>

          <div className="space-y-4 max-w-md">
            <p className="text-lg text-slate-200 font-medium leading-relaxed">
              You've already done the hard part: building an audience.
            </p>
            <p className="text-slate-400 text-base leading-relaxed">
              Now build a platform around your brand that grows with you.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden flex items-center gap-2 bg-gradient-to-r from-[#4d63ff] to-[#7b5cff] hover:from-[#6376ff] hover:to-[#9d6bff] text-white px-7 py-3.5 rounded-full font-bold shadow-[0_0_38px_rgba(112,124,255,0.42)] transition-all cursor-pointer"
          >
            <span className="absolute inset-0 b2b-scan-line opacity-60" />
            <span className="relative z-10">Build Your Platform</span>
            <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 90, scale: 0.92, rotateY: -12 }}
          whileInView={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          className="order-1 lg:order-2 w-full max-w-2xl mx-auto relative min-h-[430px] md:min-h-[520px]"
          style={{ perspective: "1200px" }}
        >
          <div className="absolute -left-4 top-10 text-7xl md:text-8xl text-white/10 b2b-float-slow pointer-events-none" style={{ transform: "rotate(-24deg)" }}>
            {"♜"}
          </div>
          <div className="absolute right-2 -top-4 text-7xl md:text-8xl text-white/10 b2b-float-medium pointer-events-none" style={{ transform: "rotate(24deg)" }}>
            {"♞"}
          </div>
          <div className="absolute left-[30%] bottom-16 text-5xl text-white/10 b2b-float-fast pointer-events-none" style={{ transform: "rotate(-18deg)" }}>
            {"♟"}
          </div>

          <div className="absolute right-4 top-8 h-[300px] w-[72%] rounded-[22px] border-2 border-[#8ea2ff]/80 b2b-border-pulse pointer-events-none" />

          <div
            className="absolute left-4 md:left-8 top-10 w-[72%] max-w-[440px] origin-bottom-left b2b-card-float"
            style={{ transform: "rotate(-3deg)" }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-[#d36bff]/70 bg-[#111631]/90 p-4 shadow-[0_0_36px_rgba(211,107,255,0.35),0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-[#707cff]/16 pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#7b5cff] flex items-center justify-center shadow-[0_0_22px_rgba(123,92,255,0.65)]">
                    <Youtube className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs md:text-sm font-semibold tracking-wide text-white">
                    YOUR BRAND
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[9px] text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                  Live analytics
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-[72px_1fr] gap-4">
                <div className="space-y-2">
                  <div className="bg-[#707cff]/25 text-[#b8c0ff] text-[10px] font-semibold py-2 px-2 rounded-lg flex items-center gap-2">
                    <BarChart3 className="w-3 h-3" /> Growth
                  </div>
                  <div className="text-slate-400 text-[10px] py-2 px-2 rounded-lg flex items-center gap-2">
                    <Users className="w-3 h-3" /> Audience
                  </div>
                  <div className="text-slate-400 text-[10px] py-2 px-2 rounded-lg flex items-center gap-2">
                    <DollarSign className="w-3 h-3" /> Revenue
                  </div>
                  <div className="text-slate-400 text-[10px] py-2 px-2 rounded-lg flex items-center gap-2">
                    <Settings className="w-3 h-3" /> Studio
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {stats.map(([label, value, delta]) => (
                      <div
                        key={label}
                        className="rounded-lg bg-white/[0.07] border border-white/[0.08] p-2.5"
                      >
                        <div className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">
                          {label}
                        </div>
                        <div className="text-sm md:text-lg font-bold text-white leading-none">
                          {value}
                        </div>
                        <div className="text-[9px] text-emerald-300 mt-1">{delta}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[0.07] border border-white/[0.08] p-3 h-28 relative overflow-hidden">
                      <div className="text-[10px] font-semibold text-slate-200 mb-2">
                        Revenue Overview
                      </div>
                      <svg
                        className="absolute inset-x-3 bottom-3 h-16"
                        viewBox="0 0 100 42"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0,38 L0,28 C15,14 25,36 38,22 C50,7 57,36 69,18 C81,0 90,17 100,6 L100,42 L0,42 Z"
                          fill="rgba(132,146,255,0.22)"
                        />
                        <path
                          d="M0,28 C15,14 25,36 38,22 C50,7 57,36 69,18 C81,0 90,17 100,6"
                          fill="none"
                          stroke="#c084fc"
                          strokeWidth="2.5"
                        />
                      </svg>
                    </div>

                    <div className="rounded-xl bg-white/[0.07] border border-white/[0.08] p-3 h-28 relative overflow-hidden">
                      <div className="text-[10px] font-semibold text-slate-200 mb-3">
                        Subscribers Growth
                      </div>
                      <div className="absolute inset-x-4 bottom-3 flex items-end gap-1.5 h-16">
                        {bars.map((height, idx) => (
                          <div
                            key={idx}
                            className="flex-1 rounded-t bg-gradient-to-t from-[#58a6ff] to-[#d36bff]"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40, y: 24, rotate: 4 }}
            whileInView={{ opacity: 1, x: 0, y: 0, rotate: 3 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, ease: "easeOut", delay: 0.35 }}
            className="absolute right-0 md:right-2 top-[150px] w-[45%] min-w-[210px] b2b-float-medium"
          >
            <div className="relative overflow-hidden rounded-2xl border border-[#8492ff]/70 bg-[#141a38]/95 shadow-[0_0_34px_rgba(88,166,255,0.35),0_18px_60px_rgba(0,0,0,0.5)]">
              <div className="aspect-video bg-gradient-to-br from-[#d9e5ff] via-[#7f8aa0] to-[#1a2441] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_48%,rgba(255,255,255,0.95),transparent_5%),linear-gradient(135deg,transparent_0_42%,rgba(255,255,255,0.18)_42%_48%,transparent_48%)]" />
                <div className="absolute left-5 bottom-3 text-5xl text-white/80 drop-shadow-[0_0_16px_rgba(255,255,255,0.6)]">
                  {"♘"}
                </div>
                <div className="absolute right-7 top-5 text-6xl text-white/75 drop-shadow-[0_0_18px_rgba(255,255,255,0.55)]">
                  {"♜"}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#7b5cff]/90 border border-white/50 flex items-center justify-center shadow-[0_0_28px_rgba(123,92,255,0.85)]">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="h-8 flex items-center gap-2 px-3">
                <div className="h-1 flex-1 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#58a6ff] to-[#d36bff]" />
                </div>
                <div className="h-3 w-3 rounded-sm border border-white/25" />
              </div>
            </div>
          </motion.div>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-10 w-[220px] md:w-[290px] b2b-bubble-float">
            <div className="relative h-32 md:h-40">
              <div className="absolute inset-x-8 bottom-0 h-9 rounded-[50%] border border-[#8ea2ff]/70 bg-[#0f1731]" />
              <div className="absolute inset-x-4 bottom-1 h-14 rounded-[50%] border border-[#d36bff]/70 bg-[#111631]" />
              <div className="absolute left-14 bottom-11 w-16 h-16 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#4d63ff] border border-cyan-200/70" />
              <div className="absolute right-14 bottom-11 w-16 h-16 rounded-full bg-gradient-to-br from-[#d36bff] to-[#7b5cff] border border-fuchsia-200/70" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-12 w-20 h-20 rounded-full bg-gradient-to-br from-[#7dd3fc] to-[#8492ff] border border-cyan-100/80" />
              <div className="absolute left-20 bottom-[86px] w-10 h-10 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#7b5cff] border border-cyan-100/80" />
              <div className="absolute right-20 bottom-[86px] w-10 h-10 rounded-full bg-gradient-to-br from-[#d36bff] to-[#8492ff] border border-fuchsia-100/80" />
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 h-20 w-[70%] b2b-reflection pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
