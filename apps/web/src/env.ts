const env = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000",
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || "development",
} as const;

export default env;
