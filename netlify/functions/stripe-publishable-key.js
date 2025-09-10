// netlify/functions/stripe-publishable-key.js
exports.handler = async function() {
  return {
    statusCode: 200,
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify({ key: process.env.STRIPE_PUBLISHABLE_KEY }),
  };
};
