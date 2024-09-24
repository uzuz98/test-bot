/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  headers: async () => [
    {
      source: "/api/token",
      headers: [
        { key: "Access-Control-Allow-Credentials", value: "true" },
        { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
        { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" }
      ],
    },
    {
      source: "/hello-world",
      headers: [
        {
          key: "Access-Control-Allow-Origin",
          value: "*", // Set your origin
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET, POST, PUT, DELETE, OPTIONS",
        }
      ],
    },
    {
      source: "/",
      headers: [
        {
          key: "Access-Control-Allow-Origin",
          value: "*", // Set your origin
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET, POST, PUT, DELETE, OPTIONS",
        }
      ],
    }
  ]
};

export default nextConfig;
