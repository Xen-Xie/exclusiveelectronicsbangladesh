import React from "react";
import { Link } from "react-router";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-gray-900 text-white py-12 font-inter">
        <div className="max-w-6xl mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4">
                Exclusive Electronics BD
              </h2>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-start">
                  <i className="fa-solid fa-location-dot mt-1 mr-3 text-primary"></i>
                  <span>
                    9 KA/KHA, Level 5, Tejgaon Industrial Area, Tejgaon, Dhaka
                    -1215
                  </span>
                </p>
                <p className="flex items-center">
                  <i className="fa-solid fa-phone mr-3 text-primary"></i>
                  <span>+8809666745745</span>
                </p>
                <p className="flex items-center">
                  <i className="fa-solid fa-envelope mr-3 text-primary"></i>
                  <span>support@exclusiveelectronicsbd.com</span>
                </p>
              </div>

              {/* Social Media Links */}
              <div className="flex space-x-4 mt-6">
                <a
                  href="https://www.facebook.com/share/1D2DZG9Efg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center transition duration-300"
                >
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a
                  href="https://www.instagram.com/md.rakibulhasanhemel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition duration-300"
                >
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a
                  href="https://github.com/Xen-Xie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 w-10 h-10 rounded-full flex items-center justify-center transition duration-300"
                >
                  <i className="fa-brands fa-github"></i>
                </a>
                <a
                  href="mailto:rh189827@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-red-500 w-10 h-10 rounded-full flex items-center justify-center transition duration-300"
                >
                  <i className="fa-solid fa-envelope"></i>
                </a>
              </div>
            </div>

            {/* About Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">About</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-primary transition duration-200"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy-policy"
                    className="hover:text-primary transition duration-200"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cookie-policy"
                    className="hover:text-primary transition duration-200"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms-and-conditions"
                    className="hover:text-primary transition duration-200"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/why-shop-with-us"
                    className="hover:text-primary transition duration-200"
                  >
                    Why Shop With Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="hover:text-primary transition duration-200"
                  >
                    Exclusive Electronics Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="hover:text-primary transition duration-200"
                  >
                    Exclusive Electronics Career
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Help</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link
                    to="/payment"
                    className="hover:text-primary transition duration-200"
                  >
                    Payment
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shipping"
                    className="hover:text-primary transition duration-200"
                  >
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link
                    to="/return-policy"
                    className="hover:text-primary transition duration-200"
                  >
                    Return And Replacement
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-primary transition duration-200"
                  >
                    Chat With Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support"
                    className="hover:text-primary transition duration-200"
                  >
                    Exclusive Electronics Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-primarybg/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-gray-400 text-sm">
                  Copyright © {currentYear}{" "}
                  <span className="text-primary font-medium">
                    Exclusive Electronics BD
                  </span>
                  . All rights reserved.
                </p>
              </div>

              <div className="text-center md:text-right">
                <p className="text-gray-400 text-sm">
                  Developed by{" "}
                  <span className="text-primary font-medium">Xen Xie Team</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
