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
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { PrimaryButton, TextInput } from "./FormControl";
import { createOrder } from "../api/Order";
import { clearCart, getOrCreateCartId } from "../utils/CartStorage";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const cartItemsFromState = location.state?.cartItems ?? [];
  const [cartItems] = useState(cartItemsFromState);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [place, setPlace] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // helpers
  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const getDigits = (value) => String(value || "").replace(/\D/g, "");

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const name = fullName.trim();
    const mail = email.trim();
    const plc = place.trim();
    const phoneDigits = getDigits(phone);

    // 🔴 STRICT VALIDATION
    if (!name) return toast.error("Please enter your full name");

    if (!mail) return toast.error("Please enter your email");

    if (!isValidEmail(mail))
      return toast.error("Please enter a valid email address");

    if (!phoneDigits) return toast.error("Please enter your mobile number");

    if (phoneDigits.length < 10)
      return toast.error("Mobile number must be exactly 10 digits");

    if (phoneDigits.length > 10)
      return toast.error("Mobile number cannot be more than 10 digits");

    if (!plc) return toast.error("Please enter your place (city & pincode)");

    if (cartItems.length === 0) return toast.error("Your cart is empty");

    try {
      setSubmitting(true);

      const cartId = getOrCreateCartId();

      const payload = {
        cartId,
        fullName: name,
        email: mail,
        phone: phoneDigits, // ✅ clean 10-digit number
        place: plc,
        items: cartItems.map((item) => ({
          productId: item.id ?? item.productId,
          quantity: item.quantity,
        })),
      };

      await createOrder(payload);

      clearCart();
      toast.success("Order placed successfully");
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
            {/* Left */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6 space-y-5">
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

              <TextInput
                label="Phone Number"
                icon={Phone}
                type="tel"
                maxLength={14}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <TextInput
                label="Place"
                icon={MapPin}
                placeholder="City, Pincode"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
              />
            </div>

            {/* Right */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 space-y-4">
              <h3 className="text-sm font-semibold">Order Summary</h3>

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal ({totalItems})</dt>
                  <dd className="font-medium">₹{subtotal.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Shipping</dt>
                  <dd className="text-emerald-600">{shippingLabel}</dd>
                </div>
                <div className="h-px bg-slate-200 my-2" />
                <div className="flex justify-between font-semibold">
                  <dt>Total</dt>
                  <dd>₹{total.toLocaleString()}</dd>
                </div>
              </dl>

              <PrimaryButton type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Enquire Now"}
              </PrimaryButton>
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
              Thank you! Your order is confirmed
            </h2>

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
