import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Phone, Mail, User, ShoppingCart, Search, Menu, X } from "lucide-react";
import Logo from "../icons/Logo";
import { NavLink, useNavigate, Link } from "react-router-dom";

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { getActiveCategories } from "../api/Category";
import { loadCart } from "../utils/CartStorage";

export default function Header() {
  const [openNav, setOpenNav] = useState(false); // ✅ Mobile drawer
  const [openCategoryList, setOpenCategoryList] = useState(false);

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [cartCount, setCartCount] = useState(0);

  // ✅ sticky-on-scroll state (Desktop only)
  const [isNavSticky, setIsNavSticky] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef(null);
  const navTopRef = useRef(0);

  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "IT Services", path: "/services" },
    { name: "Contact", path: "/contact" },
  ];

  // Load active categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCatLoading(true);
        const res = await getActiveCategories();
        const list = res?.data ?? res;
        setCategories(list || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setCatLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Cart count sync
  useEffect(() => {
    const syncFromStorage = () => {
      const items = loadCart();
      const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(count);
    };

    syncFromStorage();

    const handleCartUpdated = (event) => {
      if (event?.detail?.count !== undefined) setCartCount(event.detail.count);
      else syncFromStorage();
    };

    window.addEventListener("cart_updated", handleCartUpdated);
    return () => window.removeEventListener("cart_updated", handleCartUpdated);
  }, []);

  const closeAllMenus = () => {
    setOpenNav(false);
    setOpenCategoryList(false);
  };

  const toggleCategoryList = () => setOpenCategoryList((p) => !p);

  const handleCategoryClick = (cat) => {
    navigate(`/category/${cat.id}/products`, { state: { category: cat } });
    closeAllMenus();
  };

  // ✅ Measure nav position + height (Desktop only)
  useLayoutEffect(() => {
    const measure = () => {
      if (!navRef.current) return;
      if (window.innerWidth < 768) return;

      const rect = navRef.current.getBoundingClientRect();
      navTopRef.current = rect.top + window.scrollY;
      setNavHeight(rect.height);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // ✅ Sticky-on-scroll behavior (Desktop only)
  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth < 768) {
        if (isNavSticky) setIsNavSticky(false);
        return;
      }
      setIsNavSticky(window.scrollY >= navTopRef.current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isNavSticky]);

  const isDesktopSticky = isNavSticky;

  return (
    <header className="w-full bg-white">
      {/* Top Info Bar (UNCHANGED) */}
      <div className="bg-[var(--primary)] text-white px-4 py-2 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-6 items-center sm:items-start text-sm">
          <span className="flex items-center gap-1">
            <Phone size={16} /> +1 800 123 4567
          </span>
          <span className="flex items-center gap-1">
            <Mail size={16} /> bnc@gmail.com
          </span>
        </div>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <FaFacebookF
            size={18}
            className="cursor-pointer hover:text-gray-200 transition-colors"
          />
          <FaInstagram
            size={18}
            className="cursor-pointer hover:text-gray-200 transition-colors"
          />
          <FaTwitter
            size={18}
            className="cursor-pointer hover:text-gray-200 transition-colors"
          />
          <FaWhatsapp
            size={18}
            className="cursor-pointer hover:text-gray-200 transition-colors"
          />
        </div>
      </div>

      {/* Logo + Search + Actions (DESKTOP LOOK SAME, only search input removed) */}
      <div className="px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 cursor-pointer"
          onClick={closeAllMenus}
        >
          <div className="w-10 h-10 p-2 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow">
            <Logo />
          </div>
          <span className="font-bold text-2xl text-black">
            Bharat National Computers
          </span>
        </Link>

        {/* ✅ Search (MOBILE + DESKTOP SAME FORMAT): dropdown + search icon only */}
        <div className="w-full md:flex md:flex-1 md:max-w-xl">
          <div className="w-full rounded-xl border border-[var(--grey-300)] bg-white shadow-sm overflow-hidden flex items-stretch">
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedCategoryId(id);
                if (!id) return;

                const cat = categories.find((c) => String(c.id) === String(id));
                navigate(`/category/${id}/products`, {
                  state: { category: cat },
                });
                closeAllMenus();
              }}
              className="flex-1 h-[46px] px-3 bg-[var(--grey-100)] text-[var(--grey-900)] outline-none text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              aria-label="Search"
              className="h-[46px] w-[54px] grid place-items-center text-white"
              style={{ background: "var(--primary)" }}
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-sm text-black">
            Hotline: <b className="text-[var(--primary)]">+1 800 123 4567</b>
          </div>

          <User
            size={22}
            className="cursor-pointer hover:text-[var(--primary)] transition-colors"
          />

          <Link
            to="/cart"
            className="relative inline-flex items-center cursor-pointer hover:text-[var(--primary)] transition-colors"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--primary)] text-white text-[10px] flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Icons */}
        <div className="flex md:hidden items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="relative inline-flex items-center hover:text-[var(--primary)] transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--primary)] text-white text-[10px] flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setOpenNav(true)}
            aria-label="Open Menu"
          >
            <Menu size={28} className="text-black" />
          </button>
        </div>
      </div>

      {/* ✅ Placeholder only for Desktop sticky */}
      {isDesktopSticky && (
        <div style={{ height: navHeight }} className="hidden md:block" />
      )}

      {/* ✅ NAV BAR (ONLY CHANGED HERE) 
          - Desktop: background SAME as your old nav
          - Links: inactive black, active primary
      */}
      <nav
        ref={navRef}
        className={[
          "px-4 py-3 font-medium text-sm border-b border-[var(--grey-300)] shadow-sm transition-all duration-200",
          "bg-[var(--primary-lighthead)]", // ✅ keep same background as before
          isDesktopSticky
            ? "md:fixed md:top-0 md:left-0 md:right-0 md:z-[9999]"
            : "relative",
        ].join(" ")}
      >
        {/* Desktop links */}
        <div className="hidden md:flex items-center justify-between relative">
          <button
            type="button"
            onClick={toggleCategoryList}
            className="flex items-center gap-2 cursor-pointer text-black hover:text-[var(--primary)] transition-colors"
          >
            <Menu size={18} /> Shop By Categories
          </button>

          <div className="flex gap-10 flex-1 justify-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={closeAllMenus}
                className="relative group transition-colors"
                style={({ isActive }) => ({
                  color: isActive ? "var(--primary)" : "#000",
                  fontWeight: isActive ? 700 : 600,
                })}
              >
                {link.name}
                <span
                  className="absolute left-0 -bottom-1 w-0 h-[2px] group-hover:w-full transition-all"
                  style={{ backgroundColor: "var(--primary)" }}
                />
              </NavLink>
            ))}
          </div>

          <div className="w-40" />

          {/* Desktop categories dropdown */}
          {openCategoryList && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-[var(--grey-300)] rounded-md shadow-md z-30 text-black">
              <div className="flex justify-end px-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenCategoryList(false)}
                  className="text-[var(--grey-700)] hover:text-black"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="py-1 max-h-72 overflow-y-auto text-sm">
                {catLoading ? (
                  <p className="px-3 py-2 text-[var(--grey-700)]">Loading...</p>
                ) : categories.length === 0 ? (
                  <p className="px-3 py-2 text-[var(--grey-700)]">
                    No categories available.
                  </p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="px-3 py-2 hover:bg-[var(--grey-200)] cursor-pointer text-black"
                      onClick={() => handleCategoryClick(cat)}
                    >
                      {cat.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ✅ Mobile Drawer (LEFT SIDE) */}
      {openNav && (
        <div className="fixed inset-0 z-[99999] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeAllMenus}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-[320px] bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--grey-300)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 p-2 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                  <Logo />
                </div>
                <span className="font-bold text-[15px] text-black">BNC</span>
              </div>

              <button type="button" onClick={closeAllMenus} aria-label="Close">
                <X size={22} className="text-black" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4">
              {/* Categories */}
              <button
                type="button"
                onClick={toggleCategoryList}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-[var(--grey-300)] text-black"
              >
                <span className="flex items-center gap-2">
                  <Menu size={18} /> Shop By Categories
                </span>
                <span className="text-xs text-[var(--grey-600)]">
                  {openCategoryList ? "Hide" : "Show"}
                </span>
              </button>

              {openCategoryList && (
                <div className="mt-3 rounded-lg border border-[var(--grey-300)] overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {catLoading ? (
                      <p className="px-3 py-2 text-[var(--grey-700)]">
                        Loading...
                      </p>
                    ) : categories.length === 0 ? (
                      <p className="px-3 py-2 text-[var(--grey-700)]">
                        No categories.
                      </p>
                    ) : (
                      categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className="w-full text-left px-3 py-3 text-sm text-black hover:bg-[var(--grey-100)]"
                          onClick={() => handleCategoryClick(cat)}
                        >
                          {cat.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="mt-5 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={closeAllMenus}
                    className="px-3 py-3 rounded-lg"
                    style={({ isActive }) => ({
                      color: isActive ? "var(--primary)" : "#000",
                      fontWeight: isActive ? 800 : 600,
                      background: isActive ? "rgba(0,0,0,0.03)" : "transparent",
                    })}
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
