/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

function PrivacyPolicy() {
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
    { id: "information", title: "Information We Collect" },
    { id: "usage", title: "How We Use Your Information" },
    { id: "sharing", title: "Information Sharing" },
    { id: "cookies", title: "Cookies & Tracking" },
    { id: "data-security", title: "Data Security" },
    { id: "user-rights", title: "Your Rights" },
    { id: "children", title: "Children's Privacy" },
    { id: "third-party", title: "Third-Party Services" },
    { id: "changes", title: "Changes to This Policy" },
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
              <i className="fa-solid fa-shield-hooded text-3xl text-white"></i>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Privacy <span className="text-yellow-300">Policy</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Your privacy matters to us. Learn how we protect your information.
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
                  At <strong className="text-primary">Dropore</strong>, we take your privacy seriously. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                  information when you visit our website or make a purchase from us.
                </p>
                <p>
                  Please read this privacy policy carefully. If you do not agree with the terms 
                  of this privacy policy, please do not access the site or use our services.
                </p>
                <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <i className="fa-solid fa-shield-hooded mr-2"></i>
                    We are committed to protecting your personal information and your right to privacy.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Information We Collect */}
            <motion.section
              variants={itemVariants}
              id="information"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500/20 to-blue-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-database text-blue-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Information We Collect
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We collect information that you voluntarily provide to us when you register 
                  on the website, express an interest in obtaining information about us or our 
                  products, or when you participate in activities on the website.
                </p>
                
                <div className="bg-gray-50 rounded-xl p-5 mt-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-user text-primary"></i>
                    Personal Data
                  </h4>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                      <span>Name and contact information (email address, phone number)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                      <span>Shipping and billing addresses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                      <span>Payment information (processed securely through third-party providers)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                      <span>Account credentials (username and password)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                      <span>Order history and preferences</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 mt-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-chart-line text-primary"></i>
                    Automatically Collected Data
                  </h4>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                      <span>IP address and device information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                      <span>Browser type and operating system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                      <span>Pages visited and time spent on our website</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                      <span>Referring website and search terms</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* How We Use Your Information */}
            <motion.section
              variants={itemVariants}
              id="usage"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-green-500/20 to-green-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-gears text-green-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  How We Use Your Information
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>We use the information we collect for various purposes, including:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-cart-shopping text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Process Orders</h4>
                      <p className="text-sm text-gray-600">Manage your orders, payments, and deliveries</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-user text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Account Management</h4>
                      <p className="text-sm text-gray-600">Create and manage your account</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-envelope text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Communication</h4>
                      <p className="text-sm text-gray-600">Send order updates and promotional offers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-chart-simple text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Improve Services</h4>
                      <p className="text-sm text-gray-600">Analyze usage to enhance user experience</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Information Sharing */}
            <motion.section
              variants={itemVariants}
              id="sharing"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-purple-500/20 to-purple-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-share-nodes text-purple-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Information Sharing
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>We do not sell, trade, or rent your personal information to third parties. We may share information in the following situations:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-truck text-primary text-sm mt-1"></i>
                    <span><strong>Delivery Services:</strong> With shipping carriers to deliver your orders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-credit-card text-primary text-sm mt-1"></i>
                    <span><strong>Payment Processors:</strong> To process payments securely</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-gavel text-primary text-sm mt-1"></i>
                    <span><strong>Legal Compliance:</strong> When required by law or to protect our rights</span>
                  </li>
                </ul>
              </div>
            </motion.section>

            {/* Cookies & Tracking */}
            <motion.section
              variants={itemVariants}
              id="cookies"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-yellow-500/20 to-yellow-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-cookie-bite text-yellow-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Cookies & Tracking Technologies
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We use cookies and similar tracking technologies to track activity on our website 
                  and hold certain information. Cookies are files with small amount of data which may 
                  include an anonymous unique identifier.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <i className="fa-solid fa-chart-line text-primary text-xl mb-2"></i>
                    <p className="text-sm font-medium">Essential Cookies</p>
                    <p className="text-xs text-gray-500">Required for website functionality</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <i className="fa-solid fa-chart-simple text-primary text-xl mb-2"></i>
                    <p className="text-sm font-medium">Analytics Cookies</p>
                    <p className="text-xs text-gray-500">Help us understand user behavior</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <i className="fa-solid fa-bullhorn text-primary text-xl mb-2"></i>
                    <p className="text-sm font-medium">Marketing Cookies</p>
                    <p className="text-xs text-gray-500">Used for personalized advertising</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </div>
            </motion.section>

            {/* Data Security */}
            <motion.section
              variants={itemVariants}
              id="data-security"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-red-500/20 to-red-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-lock text-red-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Data Security
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We implement appropriate technical and organizational security measures to protect 
                  the security of your personal information. However, please remember that no method 
                  of transmission over the Internet or method of electronic storage is 100% secure.
                </p>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <p className="text-green-800 text-sm">
                    <i className="fa-solid fa-check-circle mr-2"></i>
                    We use SSL encryption to protect your data during transmission.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Your Rights */}
            <motion.section
              variants={itemVariants}
              id="user-rights"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-teal-500/20 to-teal-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-scale-balanced text-teal-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Your Rights
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>You have certain rights regarding your personal information:</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-eye text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Right to Access</h4>
                      <p className="text-sm text-gray-600">Request a copy of your personal data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-pen text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Right to Rectification</h4>
                      <p className="text-sm text-gray-600">Correct inaccurate or incomplete data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-trash text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Right to Erasure</h4>
                      <p className="text-sm text-gray-600">Request deletion of your data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fa-solid fa-download text-primary text-lg mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-gray-800">Data Portability</h4>
                      <p className="text-sm text-gray-600">Receive your data in a structured format</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Children's Privacy */}
            <motion.section
              variants={itemVariants}
              id="children"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-pink-500/20 to-pink-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-child text-pink-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Children's Privacy
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Our services are not intended for children under 13 years of age. We do not knowingly 
                  collect personal information from children under 13. If you become aware that a child 
                  has provided us with personal information, please contact us.
                </p>
              </div>
            </motion.section>

            {/* Third-Party Services */}
            <motion.section
              variants={itemVariants}
              id="third-party"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-indigo-500/20 to-indigo-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-link text-indigo-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Third-Party Services
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We may use third-party services for analytics, payment processing, and other functions. 
                  These third parties have their own privacy policies addressing how they use such information.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">SSLCommerz</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">bKash</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">Google Analytics</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">Facebook Pixel</span>
                </div>
              </div>
            </motion.section>

            {/* Changes to This Policy */}
            <motion.section
              variants={itemVariants}
              id="changes"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-arrows-rotate text-emerald-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Changes to This Policy
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
                <p>
                  You are advised to review this Privacy Policy periodically for any changes. Changes to 
                  this Privacy Policy are effective when they are posted on this page.
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
                <h2 className="text-2xl font-bold text-gray-800">
                  Contact Us
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
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
                      <p className="text-gray-600">+8801929-986172</p>
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
                By using our website, you consent to the collection and use of your information 
                as described in this Privacy Policy.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;