import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  // Sprint 1 IA cleanup: old top-level modules moved into workspaces.
  // Exact-path matches only — detail/print routes (/invoices/[id],
  // /payroll/foreman/[id], /payroll/tools, …) are intentionally untouched.
  async redirects() {
    return [
      { source: "/dispatch", destination: "/operations?tab=board", permanent: false },
      { source: "/routes", destination: "/operations?tab=schedule", permanent: false },
      { source: "/invoices", destination: "/finance?tab=invoices", permanent: false },
      { source: "/expenses", destination: "/finance?tab=expenses", permanent: false },
      { source: "/payroll", destination: "/finance?tab=payroll", permanent: false },
      { source: "/analytics", destination: "/reports", permanent: false },
    ];
  },
};

export default nextConfig;
