/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

function CookiePolicy() {
  const [activeSection, setActiveSection] = useState(null);
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const sections = [
    { id: "intro", title: "Introduction" },
    { id: "what-are-cookies", title: "What Are Cookies?" },
    { id: "how-we-use", title: "How We Use Cookies" },
    { id: "token-storage", title: "Token-Based Authentication" },
    { id: "mongodb-storage", title: "MongoDB Data Storage" },
    { id: "types-of-cookies", title: "Types of Cookies We Use" },
    { id: "cookie-management", title: "Managing Cookies" },
    { id: "third-party", title: "Third-Party Services" },
    { id: "updates", title: "Updates to This Policy" },
    { id: "contact", title: "Contact Us" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-linear-to-r from-primary to-primary/80 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
              <i className="fa-solid fa-cookie-bite text-3xl text-white"></i>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Cookie <span className="text-yellow-300">Policy</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Understanding how we use cookies, tokens, and data storage
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <i className="fa-regular fa-calendar"></i>
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-80 shrink-0"
          >
            <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-list-ul text-primary text-lg"></i>
                <h3 className="font-semibold text-gray-800">Table of Contents</h3>
              </div>
              <div className="h-px bg-gray-200 mb-4"></div>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {sections.map((section, index) => (
                  <a
                    key={index}
                    href={`#${section.id}`}
                    onClick={() => setActiveSection(section.id)}
                    className={`block py-2 px-3 rounded-lg text-sm transition-all ${
                      activeSection === section.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      {section.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="flex-1 space-y-8"
          >
            {/* Introduction */}
            <motion.section
              variants={itemVariants}
              id="intro"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-info-circle text-primary text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Introduction</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  At <strong className="text-primary">Dropore</strong>, we believe in transparency about 
                  how we collect and use data. This Cookie Policy explains how we use cookies, tokens, 
                  and similar technologies to recognize you when you visit our website.
                </p>
                <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <i className="fa-solid fa-shield-hooded mr-2"></i>
                    <strong>Important:</strong> We primarily use token-based authentication stored in 
                    MongoDB rather than traditional cookies. This provides enhanced security and better 
                    control over your data.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* What Are Cookies? */}
            <motion.section
              variants={itemVariants}
              id="what-are-cookies"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-yellow-500/20 to-yellow-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-question-circle text-yellow-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">What Are Cookies?</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Cookies are small text files that are placed on your computer or mobile device when 
                  you visit a website. They are widely used to make websites work more efficiently and 
                  provide information to the website owners.
                </p>
                <p>
                  However, at <strong>Dropore</strong>, we primarily use a different approach. Instead 
                  of traditional cookies, we use <strong>JWT (JSON Web Tokens)</strong> stored in 
                  <strong> MongoDB</strong> for authentication and session management. This provides:
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <i className="fa-solid fa-shield-hooded text-primary text-2xl mb-2"></i>
                    <p className="text-sm font-medium">Enhanced Security</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <i className="fa-solid fa-database text-primary text-2xl mb-2"></i>
                    <p className="text-sm font-medium">Server-Side Storage</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <i className="fa-solid fa-clock text-primary text-2xl mb-2"></i>
                    <p className="text-sm font-medium">Better Session Control</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* How We Use Cookies */}
            <motion.section
              variants={itemVariants}
              id="how-we-use"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-green-500/20 to-green-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-gears text-green-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">How We Use Cookies</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>We use cookies and similar technologies for the following purposes:</p>
                <div className="space-y-3 mt-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-right-to-bracket text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Authentication</h4>
                      <p className="text-sm text-gray-600">Manage your login sessions securely via JWT tokens</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-cart-shopping text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Shopping Cart</h4>
                      <p className="text-sm text-gray-600">Remember items in your cart between sessions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-chart-line text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Analytics</h4>
                      <p className="text-sm text-gray-600">Understand how visitors interact with our website</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-bolt text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Performance</h4>
                      <p className="text-sm text-gray-600">Optimize website speed and functionality</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Token-Based Authentication */}
            <motion.section
              variants={itemVariants}
              id="token-storage"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-purple-500/20 to-purple-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-key text-purple-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Token-Based Authentication</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Unlike traditional websites that rely heavily on cookies, <strong>Dropore</strong> uses 
                  a modern token-based authentication system:
                </p>
                <div className="bg-gray-50 rounded-xl p-5 mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <i className="fa-solid fa-key text-primary"></i>
                    </div>
                    <h4 className="font-semibold text-gray-800">How It Works</h4>
                  </div>
                  <ul className="space-y-3 ml-4">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                      <span>When you log in, we generate a secure JWT token</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                      <span>The token is stored in MongoDB, not in your browser cookies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                      <span>Each request to our server validates this token</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                      <span>Tokens expire after a set period for security</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <p className="text-green-800 text-sm">
                    <i className="fa-solid fa-check-circle mr-2"></i>
                    <strong>Security Benefit:</strong> This approach provides better protection against 
                    cross-site scripting (XSS) and cross-site request forgery (CSRF) attacks.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* MongoDB Data Storage */}
            <motion.section
              variants={itemVariants}
              id="mongodb-storage"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-green-600/20 to-green-600/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-database text-green-600 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">MongoDB Data Storage</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Your data is securely stored in <strong>MongoDB</strong>, a modern NoSQL database. 
                  This approach offers several advantages:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <i className="fa-solid fa-shield-alt text-primary text-xl mb-2"></i>
                    <h4 className="font-semibold text-gray-800">Enhanced Security</h4>
                    <p className="text-sm text-gray-600">Data is encrypted and protected with access controls</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <i className="fa-solid fa-chart-line text-primary text-xl mb-2"></i>
                    <h4 className="font-semibold text-gray-800">Scalability</h4>
                    <p className="text-sm text-gray-600">Can handle large amounts of data efficiently</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <i className="fa-solid fa-clock text-primary text-xl mb-2"></i>
                    <h4 className="font-semibold text-gray-800">Real-Time Updates</h4>
                    <p className="text-sm text-gray-600">Fast data retrieval and updates</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <i className="fa-solid fa-cloud-arrow-up text-primary text-xl mb-2"></i>
                    <h4 className="font-semibold text-gray-800">Cloud Backup</h4>
                    <p className="text-sm text-gray-600">Regular backups ensure data safety</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  <i className="fa-solid fa-info-circle mr-1"></i>
                  We store essential data including: user profiles, order history, cart items, 
                  and authentication tokens. All sensitive information is encrypted.
                </p>
              </div>
            </motion.section>

            {/* Types of Cookies We Use */}
            <motion.section
              variants={itemVariants}
              id="types-of-cookies"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-indigo-500/20 to-indigo-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-cookie text-indigo-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Types of Cookies We Use</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>While we primarily use token-based authentication, we still use minimal cookies for:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fa-solid fa-cookie text-primary"></i>
                      <h4 className="font-semibold text-gray-800">Essential Cookies</h4>
                    </div>
                    <p className="text-sm text-gray-600">Required for basic website functionality (shopping cart, page navigation)</p>
                    <span className="inline-block mt-2 text-xs text-gray-500">Always active</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fa-solid fa-chart-line text-primary"></i>
                      <h4 className="font-semibold text-gray-800">Analytics Cookies</h4>
                    </div>
                    <p className="text-sm text-gray-600">Help us understand how visitors use our website (Google Analytics)</p>
                    <span className="inline-block mt-2 text-xs text-gray-500">Can be disabled</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fa-solid fa-palette text-primary"></i>
                      <h4 className="font-semibold text-gray-800">Preference Cookies</h4>
                    </div>
                    <p className="text-sm text-gray-600">Remember your settings and preferences</p>
                    <span className="inline-block mt-2 text-xs text-gray-500">Can be disabled</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fa-solid fa-bullhorn text-primary"></i>
                      <h4 className="font-semibold text-gray-800">Marketing Cookies</h4>
                    </div>
                    <p className="text-sm text-gray-600">Used for personalized advertising (optional)</p>
                    <span className="inline-block mt-2 text-xs text-gray-500">Can be disabled</span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Managing Cookies */}
            <motion.section
              variants={itemVariants}
              id="cookie-management"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-teal-500/20 to-teal-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-sliders text-teal-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Managing Cookies</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-eye-slash text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Block Cookies</h4>
                      <p className="text-sm text-gray-600">Prevent all cookies from being stored on your device</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-trash text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Delete Existing Cookies</h4>
                      <p className="text-sm text-gray-600">Remove cookies that have already been set</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-bell text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Set Alerts</h4>
                      <p className="text-sm text-gray-600">Be notified when cookies are being set</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mt-4">
                  <p className="text-yellow-800 text-sm">
                    <i className="fa-solid fa-circle-info mr-2"></i>
                    <strong>Note:</strong> Disabling essential cookies may affect your ability to use 
                    certain features of our website, such as logging in or making purchases.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Third-Party Services */}
            <motion.section
              variants={itemVariants}
              id="third-party"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-pink-500/20 to-pink-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-link text-pink-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Third-Party Services</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We use third-party services that may place cookies or similar technologies:
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">Google Analytics</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">SSLCommerz</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">bKash</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">Cloudinary</span>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  These third-party services have their own privacy policies and cookie practices. 
                  We recommend reviewing their policies for more information.
                </p>
              </div>
            </motion.section>

            {/* Updates to This Policy */}
            <motion.section
              variants={itemVariants}
              id="updates"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-arrows-rotate text-emerald-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Updates to This Policy</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices 
                  or for operational, legal, or regulatory reasons. We will notify you of any changes by 
                  posting the new policy on this page.
                </p>
                <p>
                  Please review this policy periodically for any changes. The date at the top of this 
                  page indicates when it was last updated.
                </p>
              </div>
            </motion.section>

            {/* Contact Us */}
            <motion.section
              variants={itemVariants}
              id="contact"
              className="bg-linear-to-r from-primary/5 to-primary/10 rounded-2xl p-6 md:p-8 border border-primary/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-linear-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-envelope text-white text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Contact Us</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  If you have any questions about our use of cookies, tokens, or data storage, please contact us:
                </p>
                <div className="bg-white rounded-xl p-5 shadow-md space-y-3">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-envelope text-primary text-xl"></i>
                    <div>
                      <p className="font-semibold text-gray-800">Email</p>
                      <p className="text-gray-600">droporeofficial@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-phone text-primary text-xl"></i>
                    <div>
                      <p className="font-semibold text-gray-800">Phone</p>
                      <p className="text-gray-600">+880 1929-986172</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fa-regular fa-clock text-primary text-xl"></i>
                    <div>
                      <p className="font-semibold text-gray-800">Response Time</p>
                      <p className="text-gray-600">We respond within 24-48 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Footer Note */}
            <motion.div
              variants={itemVariants}
              className="bg-gray-100 rounded-xl p-6 text-center"
            >
              <i className="fa-solid fa-shield-hooded text-primary text-2xl mb-3"></i>
              <p className="text-gray-600">
                By using our website, you consent to the use of cookies and token-based authentication 
                as described in this Cookie Policy.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CookiePolicy;