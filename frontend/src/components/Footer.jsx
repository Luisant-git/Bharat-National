import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import Logo from "../icons/Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* ===== Company Info ===== */}
        <div>
          <ul className="space-y-4 text-gray-400 text-sm">
            {/* Logo */}
            <li className="flex items-center gap-3">
              <Logo className="w-10 h-10 shrink-0" />
            </li>

            {/* Company Name */}
            <li className="font-bold text-xl text-white leading-tight">
              Bharat National Computers
            </li>

            {/* Address */}
            <li className="leading-relaxed">
              123 Tech Park, IT Corridor,
              <br />
              Chennai, India 600001
              <br />
              (Near Central Railway Station)
            </li>

            {/* Map Link */}
            <li>
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-fit text-white font-semibold underline hover:text-primary transition-colors"
              >
                GET DIRECTION ↗
              </a>
            </li>

            {/* Social Icons */}
            <li className="flex items-center gap-4 pt-2">
              <FaFacebookF className="w-5 h-5 cursor-pointer hover:text-primary" />
              <FaInstagram className="w-5 h-5 cursor-pointer hover:text-primary" />
              <FaYoutube className="w-5 h-5 cursor-pointer hover:text-primary" />
              <FaWhatsapp className="w-5 h-5 cursor-pointer hover:text-primary" />
            </li>
          </ul>
        </div>

        {/* ===== Quick Links ===== */}
        <div>
          <h3 className="font-semibold mb-3 text-lg">Quick Links</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            {[
              { name: "Home", path: "/" },
              { name: "About", path: "/about" },
              { name: "Products", path: "/products" },
              { name: "Services", path: "/services" },
              { name: "Contact", path: "/contact" },
            ].map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="hover:text-primary hover:underline"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Services ===== */}
        <div>
          <h3 className="font-semibold mb-3 text-lg">Our Services</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            {[
              "Desktop & Laptop Repair",
              "Printer Service",
              "CCTV Installation",
              "Networking Solutions",
              "AMC Contracts",
            ].map((service) => (
              <li key={service}>
                <Link
                  to="/services"
                  className="hover:text-primary hover:underline"
                >
                  {service}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Newsletter ===== */}
        <div>
          <h3 className="font-semibold mb-3 text-lg">Newsletter</h3>
          <p className="text-gray-400 mb-3 text-sm">
            Sign up for our newsletter and get 10% off your first purchase
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter your e-mail"
              className="w-full px-3 py-2 rounded-md sm:rounded-r-none bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-primary"
            />
            <button className="w-full sm:w-auto bg-primary px-5 py-2 rounded-md sm:rounded-l-none font-semibold hover:bg-primary/80">
              Subscribe
            </button>
          </div>

          <label className="text-gray-500 mt-3 block text-xs">
            <input type="checkbox" className="mr-1" />
            By clicking subscribe, you agree to the{" "}
            <span className="underline cursor-pointer hover:text-primary">
              Terms
            </span>{" "}
            &{" "}
            <span className="underline cursor-pointer hover:text-primary">
              Privacy Policy
            </span>
          </label>
        </div>
      </div>

      {/* ===== Bottom Bar ===== */}
      <div className="mt-12 border-t border-gray-700 pt-4 px-4 text-center">
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 whitespace-nowrap">
          © {currentYear} Bharat National Computers. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
