export const openDummyRazorpay = ({ onSuccess }) => {
  alert("💳 Dummy Payment Pop-up\n(No Razorpay Call)");
  onSuccess(); // Directly mark paid
};
