// src/pages/CheckoutPage.jsx
import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Mail,
  X,
  CreditCard,
  ShieldCheck,
  LockKeyhole,
  Wallet,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { PrimaryButton, TextInput } from "./FormControl";
import { createOrder } from "../api/Order";
import { clearCart, getOrCreateCartId } from "../utils/CartStorage";
import { toast } from "react-toastify";
import upiLogo from "../assets/upi.png";
import mastercardLogo from "../assets/mastercard.png";
import netbankingLogo from "../assets/netbanking.png";
export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const cartItemsFromState = location.state?.cartItems ?? [];
  const [cartItems] = useState(cartItemsFromState);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // NEW: Address fields
  const [address, setAddress] = useState("");
const [place, setPlace] = useState("");
  const [pincode, setPincode] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Payment method: "online" | "cod"
  const [paymentMethod, setPaymentMethod] = useState("online");

  const { subtotal, totalItems } = useMemo(() => {
    const sub = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const qty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal: sub, totalItems: qty };
  }, [cartItems]);

  const shippingLabel = subtotal > 0 ? "Free" : "—";
  const total = subtotal;
  const isCartEmpty = cartItems.length === 0;

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const getDigits = (value) => String(value || "").replace(/\D/g, "");

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const name = fullName.trim();
    const mail = email.trim();
    const addr = address.trim();
   const plc = place.trim();
    const pin = pincode.trim();
    const phoneDigits = getDigits(phone);

    // VALIDATION
    if (!name) return toast.error("Please enter your full name");
    if (!mail) return toast.error("Please enter your email");
    if (!isValidEmail(mail))
      return toast.error("Please enter a valid email address");

    if (!phoneDigits) return toast.error("Please enter your mobile number");
    if (phoneDigits.length < 10)
      return toast.error("Mobile number must be exactly 10 digits");
    if (phoneDigits.length > 10)
      return toast.error("Mobile number cannot be more than 10 digits");

    if (!addr) return toast.error("Please enter your full address");
if (!plc) return toast.error("Please enter your place");
    if (!pin) return toast.error("Please enter your pincode");
    if (!/^\d{6}$/.test(pin))
      return toast.error("Pincode must be a 6-digit number");

    if (cartItems.length === 0) return toast.error("Your cart is empty");

    try {
      setSubmitting(true);

      const cartId = getOrCreateCartId();

      const payload = {
        cartId,
        fullName: name,
        email: mail,
        phone: phoneDigits,
       
        address: addr,
        place: plc,
        pincode: pin,
        paymentMethod, // "online" or "cod"
        items: cartItems.map((item) => ({
          productId: item.id ?? item.productId,
          quantity: item.quantity,
        })),
      };

      await createOrder(payload);

      clearCart();
      toast.success(
        paymentMethod === "online"
          ? "Payment successful! Order placed."
          : "Order placed with Cash on Delivery."
      );
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Checkout
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-500">
              Review your details and confirm your order securely.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {isCartEmpty ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Your cart is empty.{" "}
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="text-[var(--primary)] font-medium hover:underline"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            className="grid gap-6 md:grid-cols-[2fr_1.1fr]"
          >
            {/* Left: Customer + Address */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6 space-y-5">
              {/* Name + Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <TextInput
                  label="Full Name"
                  placeholder="John Doe"
                  icon={User}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <TextInput
                  label="Email"
                  placeholder="johndoe@gmail.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Phone */}
              <TextInput
                label="Phone Number"
                icon={Phone}
                type="tel"
                maxLength={14}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              {/* Address */}
              <TextInput
                label="Address"
                icon={MapPin}
                placeholder="House / Flat No, Street, Area"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              {/* City + Pincode */}
              <div className="grid md:grid-cols-2 gap-4">
               <TextInput
  label="City"
  placeholder="Chennai"
  icon={MapPin}
  value={place}
  onChange={(e) => setPlace(e.target.value)}
/>
                <TextInput
                  label="Pincode"
                  placeholder="560001"
                  icon={MapPin}
                  type="tel"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
            </div>

            {/* Right: Summary + Payment */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 space-y-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Order Summary
              </h3>

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">
                    Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})
                  </dt>
                  <dd className="font-medium">
                    ₹{subtotal.toLocaleString()}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-slate-500">Shipping</dt>
                  <dd className="text-emerald-600 font-medium">
                    {shippingLabel}
                  </dd>
                </div>

                <div className="h-px bg-slate-200 my-2" />

                <div className="flex justify-between font-semibold text-slate-900">
                  <dt>Total</dt>
                  <dd>₹{total.toLocaleString()}</dd>
                </div>
              </dl>

              {/* Payment Method */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  Payment Method
                </h3>

                {/* Online Payment */}
                <label
                  className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition ${
                    paymentMethod === "online"
                      ? "border-teal-600 bg-teal-50/60 ring-1 ring-teal-600"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="mt-1 accent-teal-600"
                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Online Payment
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Pay securely using UPI, Cards or Net Banking
                        </p>
                      </div>

                      <div className="h-9 w-9 rounded-full bg-white border border-teal-100 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-teal-700" />
                      </div>
                    </div>

                    {/* Mock logos for UPI / GPAY / PhonePe / Paytm */}
<div className="mt-3 flex items-center gap-4">
  {/* Each logo box has same width & height */}
  <div className="flex h-10 w-20 items-center justify-center">
    <img
      src={upiLogo}
      alt="UPI"
      className="max-h-full max-w-full object-contain"
    />
  </div>

  <div className="flex h-10 w-20 items-center justify-center">
    <img
      src={mastercardLogo}
      alt="Mastercard"
      className="max-h-full max-w-full object-contain"
    />
  </div>

  <div className="flex h-10 w-20 items-center justify-center">
    <img
      src={netbankingLogo}
      alt="Net Banking"
      className="max-h-full max-w-full object-contain"
    />
  </div>
</div>
                  </div>
                </label>

                {/* Cash on Delivery */}
  <label
  className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition ${
    paymentMethod === "cod"
      ? "border-teal-600 bg-teal-50/60 ring-1 ring-teal-600"
      : "border-slate-200 hover:border-slate-300 bg-white"
  }`}
>
  <input
    type="radio"
    name="paymentMethod"
    value="cod"
    checked={paymentMethod === "cod"}
    onChange={() => setPaymentMethod("cod")}
    className="mt-1 accent-teal-600"
  />

  <div className="flex-1">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          Cash on Delivery
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Pay in cash when your order is delivered.
        </p>
      </div>

      <div className="h-9 w-9 rounded-full bg-white border border-teal-100 flex items-center justify-center">
        <Wallet className="w-4 h-4 text-teal-700" />
      </div>
    </div>
  </div>
</label>
                {/* Security info for online */}
                {paymentMethod === "online" && (
                  <div className="flex gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-xs leading-5 text-emerald-700">
                      Secure payment. Your card/UPI details are not stored on
                      our website.
                    </p>
                  </div>
                )}
              </div>

              <PrimaryButton type="submit" disabled={submitting}>
                {submitting
                  ? "Processing..."
                  : paymentMethod === "online"
                  ? `Pay ₹${total.toLocaleString()} Now`
                  : "Place Order (Cash on Delivery)"}
              </PrimaryButton>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <LockKeyhole className="w-3.5 h-3.5" />
                100% secure checkout
              </p>
            </div>
          </form>
        )}
      </main>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl px-8 py-8 text-center max-w-sm w-full">
            <button
              onClick={() => {
                setShowSuccess(false);
                navigate("/products");
              }}
              className="absolute right-3 top-3 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>

            <h2 className="text-lg font-semibold">
              {paymentMethod === "online"
                ? "Payment Successful!"
                : "Order Placed!"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {paymentMethod === "online"
                ? "Thank you! Your payment is complete and your order has been confirmed."
                : "Thank you! Your order has been placed. Please pay in cash upon delivery."}
            </p>

            <PrimaryButton
              className="mt-5"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}