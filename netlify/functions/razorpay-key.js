import { Handler } from "@netlify/functions";

export const Handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      key: process.env.RAZORPAY_KEY_ID // Only key ID, never key secret
    }),
  };
};
