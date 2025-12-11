"use client";

import { motion } from "framer-motion";
import { CreditCard, Shield, Activity } from "lucide-react";

export default function GlassMorphism() {
  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center flex items-center justify-center p-8 bg-fixed">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Card 1 */}
        <motion.div
          whileHover={{ y: -10 }}
          className="w-full h-80 bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-between overflow-hidden relative"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500 rounded-full blur-[50px] opacity-60" />
          <div className="z-10">
            <CreditCard className="w-12 h-12 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Glass Wallet</h2>
            <p className="opacity-80">Next-gen transparency.</p>
          </div>
          <div className="font-mono text-xl z-10">**** **** **** 4291</div>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          whileHover={{ y: -10 }}
          className="w-full h-80 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-between overflow-hidden relative"
        >
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-blue-600/50 to-transparent pointer-events-none" />
          <div className="z-10">
            <Shield className="w-12 h-12 mb-4 text-blue-400" />
            <h2 className="text-2xl font-bold mb-2">Secure Vault</h2>
            <p className="opacity-70">Encrypted with frosted aesthetics.</p>
          </div>
          <button className="bg-blue-500/80 hover:bg-blue-500 py-3 rounded-xl font-bold backdrop-blur-sm transition-all z-10">
            Access
          </button>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          whileHover={{ y: -10 }}
          className="w-full h-80 bg-linear-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-between relative"
        >
          <div className="flex justify-between items-start">
            <div>
              <Activity className="w-12 h-12 mb-4 text-green-400" />
              <h2 className="text-xl font-semibold">System Status</h2>
            </div>
            <span className="bg-green-500/30 text-green-300 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
              ONLINE
            </span>
          </div>

          <div className="space-y-4">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ duration: 2 }}
                className="h-full bg-green-400 shadow-[0_0_10px_#4ade80]"
              />
            </div>
            <div className="flex justify-between text-xs opacity-60">
              <span>Performance</span>
              <span>75%</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
