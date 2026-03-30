/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

function TermsandConditions() {
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
    { id: "overview", title: "OVERVIEW" },
    { id: "general", title: "General Conditions" },
    { id: "pricing", title: "Availability, Pricing & Payment" },
    { id: "products", title: "Products" },
    { id: "billing", title: "Billing & Account Information" },
    { id: "discounts", title: "Discounts & Allowances" },
    { id: "third-party", title: "Third Party Links" },
    { id: "personal-info", title: "Personal Information" },
    { id: "errors", title: "Errors & Inaccuracies" },
    { id: "cancellation", title: "Order Cancellation" },
    { id: "prohibited", title: "Prohibited Uses" },
    { id: "disclaimer", title: "Disclaimer & Liability" },
    { id: "indemnification", title: "Indemnification" },
    { id: "severability", title: "Severability" },
    { id: "termination", title: "Termination" },
    { id: "governing", title: "Governing Law" },
    { id: "changes", title: "Changes to Terms" },
    { id: "contact", title: "Contact Information" },
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
              <i className="fa-solid fa-file-contract text-3xl text-white"></i>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Terms and <span className="text-yellow-300">Conditions</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Please read these terms carefully before using our services
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
            {/* Section 1: Overview */}
            <motion.section
              variants={itemVariants}
              id="overview"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-info-circle text-primary text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">OVERVIEW</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  This website is operated by{" "}
                  <strong className="text-primary">Dropore</strong>. The terms
                  "We", "Us" and "Our" are used to refer to Dropore. Dropore
                  offers all information, tools and services which are used or
                  concerns Dropore's carrying out of business, and are publicly
                  available at the website.
                </p>
                <p>
                  By visiting our website and/or purchasing something from us,
                  you become a user of the website and engage in our "Services".
                  Such engagement will consecutively mean the user agreeing to
                  be bound by the following terms and conditions.
                </p>
              </div>
            </motion.section>

            {/* Section 2: General Conditions */}
            <motion.section
              variants={itemVariants}
              id="general"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500/20 to-blue-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-scale-balanced text-blue-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  SECTION 1 – GENERAL CONDITIONS
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  By agreeing to these Terms of Service, you represent that you
                  are at the age of majority in your present State or Province
                  of residence, or that you have given us your consent to allow
                  any of your minor dependents to use this website where you are
                  the age of majority in your State or Province of residence.
                </p>
                <p>
                  You may not use our products for any illegal or unauthorized
                  purpose nor may you, in the use of the Service, violate any
                  laws in your jurisdiction (including but not limited to
                  copyright laws). You must not transmit any worms or viruses or
                  any code of a destructive nature.
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
                  <p className="text-amber-800 text-sm">
                    <i className="fa-solid fa-circle-info mr-2"></i>A breach or
                    violation of any of the Terms will result in an immediate
                    termination of your Services.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Section 3: Availability, Pricing & Payment */}
            <motion.section
              variants={itemVariants}
              id="pricing"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-green-500/20 to-green-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-credit-card text-green-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  SECTION 2 – AVAILABILITY, PRICING AND PAYMENT METHODS
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Availability and pricing of all items are subject to
                  availability. Dropore will inform you as soon as possible if
                  the product(s) and services you have ordered are not
                  available.
                </p>

                <div className="bg-gray-50 rounded-xl p-5 mt-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-money-bill-wave text-primary"></i>
                    Payment Methods
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 rounded-l-lg">
                            Payment Method
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 rounded-r-lg">
                            Condition
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">
                            Cash on Delivery
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            For orders valuing more than BDT 1000 including
                            delivery cost
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">
                            Online Payment
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            Applicable for any ordered amount as per company
                            policy
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">
                            bKash Payment
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            Applicable for any ordered amount as per company
                            policy
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-700">
                      <i className="fa-solid fa-circle-info mr-1"></i>
                      Note: For some products (Depending on Size/Price) we may
                      ask for full/partial advance payment.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Section 4: Products */}
            <motion.section
              variants={itemVariants}
              id="products"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-purple-500/20 to-purple-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-box text-purple-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  SECTION 3 – PRODUCTS
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Products are available exclusively online through Dropore.
                  These products or services may have limited quantities and are
                  subject to return or exchange only according to our Return and
                  Replacement Policy.
                </p>
                <p>
                  We reserve the right, but are not obligated, to limit the
                  sales of our products or Services to any person, geographic
                  region or jurisdiction. We may exercise this right on a
                  case-by-case basis.
                </p>
              </div>
            </motion.section>

            {/* Section 5: Billing & Account Information */}
            <motion.section
              variants={itemVariants}
              id="billing"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-cyan-500/20 to-cyan-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-receipt text-cyan-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  SECTION 4 – ACCURACY OF BILLING AND ACCOUNT INFORMATION
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We reserve the right to refuse any order you place with us. We
                  may, in our sole discretion, limit or cancel quantities
                  purchased per person or per order.
                </p>
                <p>
                  As a visitor or a customer, you agree to provide current,
                  complete and accurate account information for all purchases
                  made at our store.
                </p>
              </div>
            </motion.section>

            {/* Section 6: Discounts & Allowances */}
            <motion.section
              variants={itemVariants}
              id="discounts"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-amber-500/20 to-amber-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-tag text-amber-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  SECTION 5 – DISCOUNTS & ALLOWANCES
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Discounts and allowances (Coupon code, Promo code, Gift card
                  code, Adjustment code, App discount, Occasional offers or
                  sign-up offer etc.) are reductions of the basic price of
                  products or services.
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
                  <p className="text-amber-800 text-sm">
                    <i className="fa-solid fa-gavel mr-2"></i>
                    Dropore holds the right to change/revise/modify any Discount
                    offers OR Promotional Allowances without prior notice.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Section 7: Third Party Links */}
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
                  SECTION 6 – THIRD PARTY LINKS
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Certain content, products and services available via our
                  Service may include wholly or partly, materials from
                  third-parties only for the purpose of providing you with
                  better service.
                </p>
                <p>
                  We are not liable for any harm or damages related to the
                  purchase or use of goods, services, resources, content, or any
                  other transactions made in connection with any third-party
                  websites.
                </p>
              </div>
            </motion.section>

            {/* Section 8: Personal Information */}
            <motion.section
              variants={itemVariants}
              id="personal-info"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-pink-500/20 to-pink-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-lock text-pink-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  SECTION 7 – PERSONAL INFORMATION
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Your submission of personal information through the store is
                  governed by our Privacy Policy. Please review our{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-primary hover:underline font-medium"
                  >
                    Privacy Policy
                  </Link>{" "}
                  for more information.
                </p>
              </div>
            </motion.section>

            {/* Section 9: Errors & Inaccuracies */}
            <motion.section
              variants={itemVariants}
              id="errors"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-red-500/20 to-red-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-triangle-exclamation text-red-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  SECTION 8 – ERRORS, INACCURACIES AND OMISSIONS
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Occasionally there may be information on our website
                  containing typographical errors, inaccuracies or omissions
                  that may relate to product descriptions, pricing, promotions,
                  offers, and availability.
                </p>
                <p>
                  We reserve the right to correct any errors, inaccuracies or
                  omissions, and to change or update information or cancel
                  orders if any information is inaccurate at any time without
                  prior knowledge.
                </p>
              </div>
            </motion.section>

            {/* Section 10: Order Cancellation */}
            <motion.section
              variants={itemVariants}
              id="cancellation"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-orange-500/20 to-orange-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-ban text-orange-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  SECTION 9 – ORDER CANCELLATION
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Dropore promises to deliver quality and authentic products to
                  our customers. Therefore, we always run Quality Control checks
                  after receiving the ordered product from the authorized
                  vendors.
                </p>
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                  <p className="text-orange-800 text-sm">
                    <i className="fa-solid fa-circle-info mr-2"></i>
                    Dropore reserves all rights to cancel any order after
                    finding any quality issue from Quality Control checks of the
                    ordered product.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Section 11: Prohibited Uses */}
            <motion.section
              variants={itemVariants}
              id="prohibited"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-red-600/20 to-red-600/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-hand text-red-600 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  SECTION 10 – PROHIBITED USES
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  You are prohibited from using the website or its contents:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>For any unlawful purpose</li>
                  <li>To solicit others to perform unlawful acts</li>
                  <li>
                    To violate any international, federal, provincial or
                    national regulations
                  </li>
                  <li>To infringe upon intellectual property rights</li>
                  <li>To harass, abuse, insult, harm, or discriminate</li>
                  <li>To submit false or misleading information</li>
                </ul>
              </div>
            </motion.section>

            {/* Section 12: Disclaimer & Liability */}
            <motion.section
              variants={itemVariants}
              id="disclaimer"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-gray-500/20 to-gray-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-scale-balanced text-gray-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  SECTION 11 – DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We do not guarantee that your use of our service will be
                  uninterrupted, timely, secure or error-free. You expressly
                  agree that your use of the service is solely your risk.
                </p>
                <p>
                  The service and all products delivered to you through the
                  service are provided 'as is' and 'as available' for your use,
                  without any representation or warranties of any kind.
                </p>
              </div>
            </motion.section>

            {/* Section 13: Indemnification */}
            <motion.section
              variants={itemVariants}
              id="indemnification"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-teal-500/20 to-teal-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-shield text-teal-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  SECTION 12 – INDEMNIFICATION
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  As a user of the website and the services therein, you agree
                  to indemnify and hold Dropore harmless from any claim or
                  demand made by any third-party due to or arising out of your
                  breach of these Terms of Service.
                </p>
              </div>
            </motion.section>

            {/* Section 14: Severability */}
            <motion.section
              variants={itemVariants}
              id="severability"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-slate-500/20 to-slate-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-puzzle-piece text-slate-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  SECTION 13 – SEVERABILITY
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  In the event that any provision of these Terms of Service is
                  determined to be unlawful, void or unenforceable, such
                  provision shall nonetheless be enforceable to the fullest
                  extent permitted by applicable law.
                </p>
              </div>
            </motion.section>

            {/* Section 15: Termination */}
            <motion.section
              variants={itemVariants}
              id="termination"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-rose-500/20 to-rose-500/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-stop-circle text-rose-500 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  SECTION 14 – TERMINATION
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  These Terms of Service are effective unless and until
                  terminated by either you or us. You may terminate these Terms
                  of Service at any time by notifying us that you no longer wish
                  to use our Services.
                </p>
              </div>
            </motion.section>

            {/* Section 16: Governing Law */}
            <motion.section
              variants={itemVariants}
              id="governing"
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-blue-600/20 to-blue-600/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-gavel text-blue-600 text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  SECTION 15 – GOVERNING LAW
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  These Terms of Service and any separate agreements whereby we
                  provide you Services shall be governed by and construed in
                  accordance with the applicable laws governing eCommerce in
                  Bangladesh.
                </p>
              </div>
            </motion.section>

            {/* Section 17: Changes to Terms */}
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
                  SECTION 16 – CHANGES TO TERMS OF SERVICE
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We reserve the right to update, change or replace any part of
                  these Terms of Service by posting updates and changes to our
                  website. Your continued use of our website following the
                  posting of any changes constitutes acceptance of those
                  changes.
                </p>
              </div>
            </motion.section>

            {/* Section 18: Contact Information */}
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
                  SECTION 17 – CONTACT INFORMATION
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  For more information regarding the Terms of Service or if you
                  have any queries or concerns, please contact us at:
                </p>
                <div className="bg-white rounded-xl p-5 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <i className="fa-solid fa-envelope text-primary text-xl"></i>
                    <p className="font-semibold text-gray-800">
                      droporeofficial@gmail.com
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fa-regular fa-clock text-primary text-xl"></i>
                    <p className="text-sm text-gray-600">
                      We typically respond to all inquiries within 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Footer Note */}
            <motion.div
              variants={itemVariants}
              className="bg-gray-100 rounded-xl p-6 text-center"
            >
              <i className="fa-solid fa-check-circle text-green-500 text-2xl mb-3"></i>
              <p className="text-gray-600">
                By using our website and services, you acknowledge that you have
                read, understood, and agree to be bound by these Terms and
                Conditions.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default TermsandConditions;
