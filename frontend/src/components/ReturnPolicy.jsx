/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

function ReturnPolicy() {
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
    { id: "overview", title: "Overview" },
    { id: "eligibility", title: "Return Eligibility" },
    { id: "return-period", title: "Return Period" },
    { id: "return-process", title: "Return Process" },
    { id: "refund-options", title: "Refund Options" },
    { id: "non-returnable", title: "Non-Returnable Items" },
    { id: "damaged-items", title: "Damaged or Defective Items" },
    { id: "exchange-policy", title: "Exchange Policy" },
    { id: "shipping-returns", title: "Shipping for Returns" },
    { id: "refund-timeline", title: "Refund Timeline" },
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
              <i className="fa-solid fa-rotate-left text-3xl text-white"></i>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Return & <span className="text-yellow-300">Refund Policy</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Our commitment to your satisfaction
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
                <h3 className="font-semibold text-gray-800">
                  Table of Contents
                </h3>
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
            {/* Overview */}
            <motion.section
              variants={itemVariants}
              id="overview"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-info-circle text-primary text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  At <strong className="text-primary">Dropore</strong>, your
                  satisfaction is our top priority. We stand behind the quality
                  of our products and want you to be completely happy with your
                  purchase. If you're not satisfied for any reason, we're here
                  to help.
                </p>
                <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <i className="fa-solid fa-shield-heart mr-2"></i>
                    Our return policy is designed to be fair, transparent, and
                    customer-friendly.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Return Eligibility */}
            <motion.section
              variants={itemVariants}
              id="eligibility"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-green-500/20 to-green-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-check-circle text-green-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Return Eligibility
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  To be eligible for a return, your item must meet the following
                  conditions:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                    <span>
                      Item must be unused and in the same condition that you
                      received it
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                    <span>
                      Item must be in the original packaging with all tags
                      attached
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                    <span>
                      Proof of purchase (order number or receipt) is required
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                    <span>Item must not be from the non-returnable list</span>
                  </li>
                </ul>
              </div>
            </motion.section>

            {/* Return Period */}
            <motion.section
              variants={itemVariants}
              id="return-period"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-yellow-500/20 to-yellow-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-regular fa-calendar-check text-yellow-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Return Period
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  You have <strong className="text-primary">7 days</strong> from
                  the date of delivery to initiate a return.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <i className="fa-regular fa-clock mr-2"></i>
                    Returns requested after 7 days may not be accepted. We
                    recommend inspecting your items immediately upon delivery.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Return Process */}
            <motion.section
              variants={itemVariants}
              id="return-process"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500/20 to-blue-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-arrows-spin text-blue-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Return Process
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>To initiate a return, please follow these steps:</p>
                <div className="space-y-4 mt-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Contact Our Support Team
                      </h4>
                      <p className="text-sm text-gray-600">
                        Email us at rh189827@gmail.com with your order number
                        and reason for return
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Wait for Return Authorization
                      </h4>
                      <p className="text-sm text-gray-600">
                        We'll review your request and provide return
                        instructions within 24-48 hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Pack and Ship Your Item
                      </h4>
                      <p className="text-sm text-gray-600">
                        Securely package the item with all original contents and
                        shipping label
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Receive Your Refund or Exchange
                      </h4>
                      <p className="text-sm text-gray-600">
                        Once we receive and inspect your return, we'll process
                        your request
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Refund Options */}
            <motion.section
              variants={itemVariants}
              id="refund-options"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-purple-500/20 to-purple-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-money-bill-wave text-purple-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Refund Options
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <i className="fa-solid fa-credit-card text-primary text-xl mb-2"></i>
                  <h4 className="font-semibold text-gray-800">
                    Original Payment Method
                  </h4>
                  <p className="text-sm text-gray-600">
                    Refund will be issued to your original payment method
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <i className="fa-solid fa-gift text-primary text-xl mb-2"></i>
                  <h4 className="font-semibold text-gray-800">Store Credit</h4>
                  <p className="text-sm text-gray-600">
                    Receive credit for future purchases on Dropore
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <i className="fa-solid fa-exchange-alt text-primary text-xl mb-2"></i>
                  <h4 className="font-semibold text-gray-800">Exchange</h4>
                  <p className="text-sm text-gray-600">
                    Replace with a different size, color, or product
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <i className="fa-solid fa-wallet text-primary text-xl mb-2"></i>
                  <h4 className="font-semibold text-gray-800">Bank Transfer</h4>
                  <p className="text-sm text-gray-600">
                    For cash on delivery orders, refund via bank transfer
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Non-Returnable Items */}
            <motion.section
              variants={itemVariants}
              id="non-returnable"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-red-500/20 to-red-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-ban text-red-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Non-Returnable Items
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>The following items cannot be returned or exchanged:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-times-circle text-red-500 text-sm mt-1"></i>
                    <span>Personal care items (cosmetics, skincare, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-times-circle text-red-500 text-sm mt-1"></i>
                    <span>Underwear and intimate apparel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-times-circle text-red-500 text-sm mt-1"></i>
                    <span>Gift cards and vouchers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-times-circle text-red-500 text-sm mt-1"></i>
                    <span>
                      Items marked as "Final Sale" or "Non-Returnable"
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-times-circle text-red-500 text-sm mt-1"></i>
                    <span>Perishable goods (food, flowers, etc.)</span>
                  </li>
                </ul>
              </div>
            </motion.section>

            {/* Damaged or Defective Items */}
            <motion.section
              variants={itemVariants}
              id="damaged-items"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-orange-500/20 to-orange-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-truck-ramp-box text-orange-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Damaged or Defective Items
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  If you receive a damaged, defective, or incorrect item, please
                  contact us immediately:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                    <span>Contact us within 48 hours of delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                    <span>
                      Provide photos of the damaged item and packaging
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                    <span>
                      We'll arrange for return shipping at no cost to you
                    </span>
                  </li>
                </ul>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <p className="text-green-800 text-sm">
                    <i className="fa-solid fa-check-circle mr-2"></i>
                    We'll process a replacement or full refund as soon as we
                    verify the issue.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Exchange Policy */}
            <motion.section
              variants={itemVariants}
              id="exchange-policy"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-teal-500/20 to-teal-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-arrows-rotate text-teal-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Exchange Policy
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We offer exchanges for size, color, or model variations.
                  Exchange requests must meet the same eligibility criteria as
                  returns and are subject to product availability.
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                    <span>Exchanges available within 7 days of delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                    <span>
                      Product must be unused and in original condition
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                    <span>Price difference will be adjusted accordingly</span>
                  </li>
                </ul>
              </div>
            </motion.section>

            {/* Shipping for Returns */}
            <motion.section
              variants={itemVariants}
              id="shipping-returns"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-cyan-500/20 to-cyan-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-truck text-cyan-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Shipping for Returns
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">
                    For Customer-Initiated Returns:
                  </strong>
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-info text-primary text-sm mt-1"></i>
                    <span>
                      Customers are responsible for return shipping costs
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-info text-primary text-sm mt-1"></i>
                    <span>We recommend using a trackable shipping service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-info text-primary text-sm mt-1"></i>
                    <span>Original shipping costs are non-refundable</span>
                  </li>
                </ul>
                <p className="mt-4">
                  <strong className="text-gray-800">
                    For Defective or Incorrect Items:
                  </strong>
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                    <span>Return shipping costs are covered by Dropore</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-circle-check text-green-500 text-sm mt-1"></i>
                    <span>We'll provide a prepaid shipping label</span>
                  </li>
                </ul>
              </div>
            </motion.section>

            {/* Refund Timeline */}
            <motion.section
              variants={itemVariants}
              id="refund-timeline"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-indigo-500/20 to-indigo-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-regular fa-hourglass-half text-indigo-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Refund Timeline
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>Once we receive your returned item:</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span>Inspection Time</span>
                    <span className="font-medium text-gray-800">
                      3-5 business days
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span>Refund Processing</span>
                    <span className="font-medium text-gray-800">
                      5-7 business days
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span>Bank/Card Processing</span>
                    <span className="font-medium text-gray-800">
                      3-10 business days
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-gray-600">
                    <i className="fa-regular fa-clock mr-2"></i>
                    Total processing time may vary depending on your payment
                    method and financial institution.
                  </p>
                </div>
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
                  For any questions about returns, exchanges, or refunds, please
                  reach out to our support team:
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
                    <i className="fa-regular fa-clock text-primary text-xl"></i>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Response Time
                      </p>
                      <p className="text-gray-600">
                        We respond to all inquiries within 24-48 hours
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Please include your order number in all correspondence for
                  faster assistance.
                </p>
              </div>
            </motion.section>

            {/* Footer Note */}
            <motion.div
              variants={itemVariants}
              className="bg-gray-100 rounded-xl p-6 text-center"
            >
              <i className="fa-solid fa-hand-holding-heart text-primary text-2xl mb-3"></i>
              <p className="text-gray-600">
                We're committed to making your shopping experience with Dropore
                completely satisfying. If you have any concerns, please don't
                hesitate to reach out.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ReturnPolicy;
