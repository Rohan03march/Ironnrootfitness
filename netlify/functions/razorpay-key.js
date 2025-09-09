export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      key: process.env.RAZORPAY_KEY_ID
    })
  };
}
