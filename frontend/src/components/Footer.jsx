import React from "react";
import { Link } from "react-router";

function Footer() {
  const currentYear = new Date().getFullYear();

  const aboutLinks = [
    { to: "/about", label: "About Us" },
    { to: "/privacy-policy", label: "Privacy Policy" },
    { to: "/cookie-policy", label: "Cookie Policy" },
    { to: "/terms-and-conditions", label: "Terms & Conditions" },
    { to: "/why-shop-with-us", label: "Why Shop With Us" },
    { to: "/blog", label: "Exclusive Electronics Blog" },
    { to: "/careers", label: "Exclusive Electronics Career" },
  ];

  const helpLinks = [
    { to: "/payment", label: "Payment" },
    { to: "/shipping", label: "Shipping" },
    { to: "/return-policy", label: "Return And Replacement" },
    { to: "/contact", label: "Chat With Us" },
    { to: "/support", label: "Exclusive Electronics Support" },
  ];

  const socialLinks = [
    {
      href: "https://www.facebook.com/share/1D2DZG9Efg/",
      icon: "fa-brands fa-facebook-f",
      label: "Facebook",
      color: "hover:bg-blue-600",
    },
    {
      href: "https://www.instagram.com/md.rakibulhasanhemel/",
      icon: "fa-brands fa-instagram",
      label: "Instagram",
      color: "hover:bg-pink-600",
    },
    {
      href: "https://github.com/Xen-Xie",
      icon: "fa-brands fa-github",
      label: "GitHub",
      color: "hover:bg-gray-600",
    },
    {
      href: "mailto:rh189827@gmail.com",
      icon: "fa-solid fa-envelope",
      label: "Email",
      color: "hover:bg-red-500",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white py-12 font-inter">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info - Full width on mobile, centered */}
          <div className="lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            {/* Centered Logo on Mobile */}
            <div className="w-full flex justify-center mb-6 md:justify-start md:mb-4">
              <img
                src="/footerlogo.png"
                alt="Exclusive Electronics Bangladesh"
                className="h-28 xs:h-32 md:h-36 lg:h-40 w-auto"
              />
            </div>

            <div className="space-y-3 text-gray-300 max-w-md">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-location-dot text-primary text-lg mt-1 shrink-0"></i>
                <span className="text-sm md:text-base">
                  9 KA/KHA, Level 5, Tejgaon Industrial Area, Tejgaon, Dhaka -
                  1215
                </span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-phone text-primary text-lg shrink-0"></i>
                <span className="text-sm md:text-base">+8809666745745</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-envelope text-primary text-lg shrink-0"></i>
                <span className="text-sm md:text-base">
                  support@exclusiveelectronicsbd.com
                </span>
              </div>
            </div>

            {/* Social Media Links - Centered on Mobile */}
            <div className="flex justify-center md:justify-start gap-4 mt-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center transition duration-300 ${social.color}`}
                  aria-label={social.label}
                >
                  <i className={`${social.icon} text-white`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4 text-white">About</h3>
            <ul className="space-y-2 text-gray-300">
              {aboutLinks.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.to}
                    className="hover:text-primary transition duration-200 block text-sm md:text-base py-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Section */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4 text-white">Help</h3>
            <ul className="space-y-2 text-gray-300">
              {helpLinks.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.to}
                    className="hover:text-primary transition duration-200 block text-sm md:text-base py-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
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
  );
}

export default Footer;
