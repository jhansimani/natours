import axios from 'axios';

import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51LkMCqSGUft6NVkUoREyqv47LAWTk5LFWITu6x9bJtpJVI3Eh5t1iXt8ZnGTlB4OjJqdAqGI9u4LehAkXPQy9tsH009soperJp'
);
export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    // 2) create checkout form +
    console.log(session);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
    // window.location.replace(session.data.session.id);
  } catch (err) {
    showAlert('error', err);
  }
};
