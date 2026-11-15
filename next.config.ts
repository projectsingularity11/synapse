import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  // Keep dev RSC debug data inline: this cloud host blocks the debug WebSocket.
  experimental: { reactDebugChannel: false },
};
export default config;
