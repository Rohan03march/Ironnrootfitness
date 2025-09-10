const crypto = require("crypto");

exports.handler = async (event) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = JSON.parse(event.body);

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      return {
        statusCode: 200,
        body: JSON.stringify({ valid: true }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ valid: false, message: "Invalid signature" }),
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ valid: false, message: err.message }),
    };
  }
};
