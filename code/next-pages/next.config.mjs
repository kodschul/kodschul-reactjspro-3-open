/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  rewrites: () => {
    return [
      {
        source: "/about-us",
        destination: "/about",
      },
    ];
  },
};

export default nextConfig;
