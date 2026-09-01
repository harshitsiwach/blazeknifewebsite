/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false,
      lokijs: false,
      encoding: false,
      '@react-native-async-storage/async-storage': false,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
      lokijs: false,
      encoding: false,
      '@react-native-async-storage/async-storage': false,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};
export default nextConfig;



