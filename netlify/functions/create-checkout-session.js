const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { formData } = JSON.parse(event.body);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: formData.plan || "Personal Nutrition Plan" },
            unit_amount: (formData.amount || 1499) * 100,
          },
          quantity: 1,
        },
      ],
      customer_email: formData.email || undefined,
      success_url: `${process.env.URL}/success.html`,
      cancel_url: `${process.env.URL}/cancel.html`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
