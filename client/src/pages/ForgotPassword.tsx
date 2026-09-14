import { Link } from "wouter";
import { NWQIcon } from "@/components/NWQIcon";
import { Mail, ArrowLeft, Clock } from "lucide-react";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <NWQIcon size={40} />
              <span className="text-white font-bold text-lg tracking-wide group-hover:text-red-400 transition-colors">
                NodeWaves Quest
              </span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-white mb-3">
            Password Reset
          </h1>
          <p className="text-amber-400 font-semibold text-sm mb-4 uppercase tracking-wider">
            Coming Soon
          </p>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Password reset by email will be available soon. We are setting up
            secure email delivery for NodeWaves Quest.
          </p>

          {/* Beta support note */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold mb-1">
                  Beta Support
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  For beta access, contact the NodeWaves team directly to reset
                  your password. Password reset by email will be added in the
                  next update.
                </p>
              </div>
            </div>
          </div>

          {/* Back to login */}
          <Link href="/login">
            <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </Link>
        </div>

        {/* Safety line */}
        <p className="text-center text-gray-600 text-xs mt-6 leading-relaxed">
          NodeWaves Quest is an educational platform. XP, badges, and ranks are
          not financial instruments.
        </p>
      </div>
    </div>
  );
}
