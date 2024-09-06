/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  headers:async () => [
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
