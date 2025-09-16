// // netlify/functions/create-order.js
// const Razorpay = require("razorpay");

// exports.handler = async function(event, context) {
//   try {
//     const instance = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET
//     });

//     const { amount, currency } = JSON.parse(event.body);

//     const order = await instance.orders.create({
//       amount,
//       currency,
//       payment_capture: 1
//     });

//     return {
//       statusCode: 200,
//       body: JSON.stringify(order),
//     };
//   } catch (err) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: err.message }),
//     };
//   }
// };



/** For offer only  */

// netlify/functions/create-order.js
const Razorpay = require("razorpay");

exports.handler = async function(event, context) {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const { amount, currency } = JSON.parse(event.body);

    const order = await instance.orders.create({
      amount,
      currency,
      payment_capture: 1,
      offer_id: "offer_RIC0zk7e73bDns", // ✅ Add your live Offer ID here
    });

    return {
      statusCode: 200,
      body: JSON.stringify(order),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

