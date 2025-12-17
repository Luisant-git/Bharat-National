// src/components/CartPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Trash2, ArrowRight, ShoppingCart } from "lucide-react"; // 👈 added ShoppingCart
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "./FormControl";
import { loadCart, saveCart } from "../utils/CartStorage";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // Load cart items from localStorage on first render
  useEffect(() => {
    const stored = loadCart();
    setCartItems(stored);
  }, []);

  const updateQty = (id, delta) => {
    setCartItems((items) => {
      const next = items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0);

      saveCart(next);
      return next;
    });
  };

  const removeItem = (id) => {
    setCartItems((items) => {
      const next = items.filter((item) => item.id !== id);
      saveCart(next);
      return next;
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* simple page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Shopping Cart
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500">
            Review the items in your cart before checkout.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {isCartEmpty ? (
          /* ========= PREMIUM EMPTY STATE ========= */
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <ShoppingCart className="w-10 h-10 text-slate-400" />
            </div>

            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
              Your Cart is Empty
            </h2>

            <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-md">
              Looks like you haven&apos;t added any products yet.
            </p>

            <PrimaryButton
              type="button"
              className="mt-6 w-auto px-6"
              onClick={() => navigate("/products")}
            >
              Start Shopping
            </PrimaryButton>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
            {/* Cart items */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-3 border-b last:border-b-0 border-slate-100"
                >
                  {/* image */}
                  <div className="h-20 w-28 overflow-hidden rounded-xl bg-slate-100 flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* title + price */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm md:text-base font-semibold text-slate-900 truncate">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      ₹{item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* qty + delete */}
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50/60 px-2">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1)}
                        className="p-1 text-slate-500 hover:text-slate-900"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-2 min-w-[1.75rem] text-center text-sm font-medium text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, +1)}
                        className="p-1 text-slate-500 hover:text-slate-900"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-full text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Order Summary
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">
                    Subtotal ({totalItems} item{totalItems > 1 ? "s" : ""})
                  </dt>
                  <dd className="font-medium text-slate-900">
                    ₹{subtotal.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Shipping</dt>
                  <dd className="font-medium text-emerald-600">
                    {shippingLabel}
                  </dd>
                </div>
                <div className="h-px bg-slate-200 my-2" />
                <div className="flex justify-between text-base">
                  <dt className="font-semibold text-slate-900">Total</dt>
                  <dd className="font-semibold text-slate-900">
                    ₹{total.toLocaleString()}
                  </dd>
                </div>
              </dl>

              <PrimaryButton
                type="button"
                iconRight={ArrowRight}
                onClick={() => navigate("/checkout", { state: { cartItems } })}
                className="mt-5"
              >
                Proceed to Checkout
              </PrimaryButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
