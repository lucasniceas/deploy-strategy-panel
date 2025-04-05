/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DISABLE_ASSISTANT: 'true',
    HIDE_SUPPORT_WIDGET: 'true',
    ENABLE_CHAT_WIDGET: 'false',
  },
};

export default nextConfig;

