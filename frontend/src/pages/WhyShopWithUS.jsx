/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router";
import Btn from "../components/Common/Btn";

function WhyShopWithUs() {
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

  const features = [
    {
      icon: "fa-solid fa-gem",
      title: "Premium Quality",
      description:
        "Every product is carefully curated and quality-checked before reaching your doorstep.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: "fa-solid fa-truck-fast",
      title: "Fast Delivery",
      description:
        "Quick processing and reliable shipping to get your orders to you as soon as possible.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: "fa-solid fa-shield-alt",
      title: "Secure Shopping",
      description:
        "Your transactions are protected with industry-standard encryption and security measures.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: "fa-solid fa-undo-alt",
      title: "Easy Returns",
      description:
        "Hassle-free return policy to ensure your complete satisfaction with every purchase.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: "fa-solid fa-headset",
      title: "24/7 Support",
      description:
        "Our dedicated support team is always ready to assist you with any questions.",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: "fa-solid fa-tag",
      title: "Best Prices",
      description:
        "Competitive pricing and regular offers to give you the best value for your money.",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: "fa-solid fa-mobile-alt",
      title: "Mobile Friendly",
      description:
        "Shop anytime, anywhere with our fully responsive website optimized for all devices.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: "fa-solid fa-check-circle",
      title: "Authentic Products",
      description:
        "We source directly from trusted manufacturers to ensure authenticity and reliability.",
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  const benefits = [
    {
      title: "Curated Selection",
      description:
        "Hand-picked products that meet our strict quality standards",
      icon: "fa-solid fa-star",
    },
    {
      title: "Secure Payments",
      description: "Multiple payment options with end-to-end encryption",
      icon: "fa-solid fa-lock",
    },
    {
      title: "Real-time Tracking",
      description: "Track your orders from our warehouse to your doorstep",
      icon: "fa-solid fa-location-dot",
    },
    {
      title: "Loyalty Rewards",
      description:
        "Earn points on every purchase and unlock exclusive benefits",
      icon: "fa-solid fa-gift",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
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
              <i className="fa-solid fa-heart text-3xl text-white"></i>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Why Shop With <span className="text-yellow-300">Dropore</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Discover the reasons why thousands choose us for their online
              shopping needs
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Introduction Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Trusted Shopping Partner
          </h2>
          <div className="w-20 h-1 bg-linear-to-r from-primary to-primary/50 rounded-full mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            At <span className="text-primary font-semibold">Dropore</span>, we
            believe in creating a shopping experience that is not just
            convenient, but truly exceptional. Here's what makes us different.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div
                className={`w-14 h-14 bg-linear-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}
              >
                <i className={`${feature.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* What Makes Us Different */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Makes Us Different
            </h2>
            <div className="w-20 h-1 bg-linear-to-r from-primary to-primary/50 rounded-full mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We go beyond just selling products to create a complete shopping
              experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-8 shadow-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-eye text-primary text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Quality Assurance
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Every product in our catalog undergoes rigorous quality checks
                before being listed. We partner with trusted manufacturers and
                conduct regular inspections to ensure you receive only the best.
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <i className="fa-solid fa-check-circle"></i>
                <span>100% quality verified</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-8 shadow-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-hand-holding-heart text-primary text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Customer First
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your satisfaction is our priority. From easy navigation to
                hassle-free returns, we design every aspect of your shopping
                experience with you in mind. Our support team is always ready to
                help.
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <i className="fa-solid fa-headset"></i>
                <span>Dedicated support team</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Key Benefits Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key Benefits
            </h2>
            <div className="w-20 h-1 bg-linear-to-r from-primary to-primary/50 rounded-full mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the advantages of shopping with Dropore
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className={`${benefit.icon} text-primary text-xl`}></i>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Shopping Experience Section */}
        <div className="mb-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="order-2 md:order-1"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Seamless Shopping Experience
              </h2>
              <div className="w-16 h-1 bg-linear-to-r from-primary to-primary/50 rounded-full mb-6"></div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our platform is designed to make your shopping journey smooth
                and enjoyable. From intuitive search and filtering to secure
                checkout, we've optimized every step.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-magnifying-glass text-primary"></i>
                  <span className="text-gray-700">
                    Smart search and filters
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-cart-shopping text-primary"></i>
                  <span className="text-gray-700">
                    One-click cart management
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-credit-card text-primary"></i>
                  <span className="text-gray-700">
                    Multiple payment options
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-truck-fast text-primary"></i>
                  <span className="text-gray-700">
                    Real-time order tracking
                  </span>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="order-1 md:order-2"
            >
              <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl p-8 text-center">
                <i className="fa-solid fa-mobile-screen-button text-6xl text-primary mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Shop Anywhere, Anytime
                </h3>
                <p className="text-gray-600">
                  Fully responsive design means you can shop from your desktop,
                  tablet, or mobile device
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Trust & Security Section */}
        <div className="mb-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl p-8 text-center">
                <i className="fa-solid fa-shield-hooded text-6xl text-primary mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Your Security Matters
                </h3>
                <p className="text-gray-600">
                  Industry-standard encryption protects your personal and
                  payment information
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center md:text-left"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Safe & Secure Shopping
              </h2>
              <div className="w-16 h-1 bg-linear-to-r from-primary to-primary/50 rounded-full mx-auto md:mx-0 mb-6"></div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your privacy and security are paramount. We use advanced
                security measures to protect your information and ensure safe
                transactions.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                  SSL Encryption
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                  Secure Payments
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                  Data Protection
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                  Privacy Guaranteed
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-linear-to-r from-primary to-primary/90 rounded-2xl p-8 md:p-12 text-center"
        >
          <i className="fa-regular fa-heart text-4xl text-white/80 mb-4"></i>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to Experience the Difference?
          </h3>
          <p className="text-white/90 text-lg mb-6">
            Join thousands of satisfied customers who choose Dropore for their
            shopping needs
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            <Btn
              variant="secondary"
              className="px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all "
            >
              <Link to="/products" className="">
                Start Shopping Now
                <i className="fa-solid fa-arrow-right text-sm"></i>
              </Link>
            </Btn>
            <Btn
              variant="outline"
              className="text-primarybg px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Link to="/contact">
                Contact Us
                <i className="fa-solid fa-envelope text-sm"></i>
              </Link>
            </Btn>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default WhyShopWithUs;
