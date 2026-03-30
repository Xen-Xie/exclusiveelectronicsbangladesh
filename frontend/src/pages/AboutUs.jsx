/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Btn from "../components/Common/Btn";
import { Link } from "react-router";

export default function AboutUs() {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const stats = [
    { number: "100%", label: "Secure Shopping", icon: "fa-solid fa-shield" },
    {
      number: "24/7",
      label: "Customer Support",
      icon: "fa-regular fa-headset",
    },
  ];

  const values = [
    {
      title: "Quality First",
      description: "We carefully curate products that meet our high standards.",
      icon: "fa-solid fa-gem",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Customer Centric",
      description: "Your satisfaction is our top priority.",
      icon: "fa-regular fa-heart",
      color: "from-red-500 to-red-600",
    },
    {
      title: "Fast Delivery",
      description: "Quick processing and reliable shipping.",
      icon: "fa-solid fa-truck-fast",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Best Prices",
      description: "Quality products at affordable rates.",
      icon: "fa-solid fa-tag",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-linear-to-r from-primary to-primary/80 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
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
              <i className="fa-solid fa-store text-3xl text-white"></i>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              About <span className="text-yellow-300">Dropore</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Your trusted online shopping destination in Bangladesh
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Mission Section */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid md:grid-cols-2 gap-12 items-center mb-20"
        >
          <motion.div variants={itemVariants} className="order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-primary">Dropore</span>
            </h2>
            <div className="w-20 h-1 bg-linear-to-r from-primary to-primary/50 rounded-full mb-6"></div>
            <p className="text-gray-600 leading-relaxed mb-4">
              At <span className="font-semibold text-primary">Dropore</span>,
              we're revolutionizing online shopping in Bangladesh. Our platform
              brings you a curated selection of high-quality products at
              competitive prices, ensuring you get the best value for your
              money.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              From cutting-edge electronics to trendy fashion accessories, we've
              got everything you need. Every product on our site is carefully
              vetted to meet our strict quality standards, giving you peace of
              mind with every purchase.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our dedicated team works tirelessly to process orders quickly and
              ensure safe, timely delivery right to your doorstep. We believe in
              transparency, honesty, and providing real value to our customers.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="order-1 md:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-primary/10 rounded-2xl blur-2xl"></div>
              <div className="relative bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl p-8 text-center">
                <i className="fa-solid fa-quote-left text-4xl text-primary/30 mb-4"></i>
                <p className="text-gray-700 italic text-lg mb-6">
                  "Making online shopping simple, reliable, and accessible for
                  everyone in Bangladesh."
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-shop text-white text-xl"></i>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Dropore Team</p>
                    <p className="text-sm text-gray-500">Since 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-20"
        >
          <div className="grid xs:grid-cols-2 gap-2.5">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-12 h-12 bg-linear-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className={`${stat.icon} text-primary text-xl`}></i>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {stat.number}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Values Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <div className="w-20 h-1 bg-linear-to-r from-primary to-primary/50 rounded-full mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              What makes Dropore your trusted shopping partner
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                <div
                  className={`w-16 h-16 bg-linear-to-r ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <i className={`${value.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-linear-to-r from-primary to-primary/90 rounded-2xl p-8 md:p-12 text-center"
        >
          <i className="fa-regular fa-heart text-4xl text-white/80 mb-4"></i>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Thank You for Choosing Dropore
          </h3>
          <p className="text-white/90 text-lg mb-6">
            We're here to serve you — always.
          </p>
          <Btn
            variant="outline"
            className="text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
          >
            <Link to={"/contact"}>Get in Touch</Link>
            <i className="fa-solid fa-arrow-right text-sm"></i>
          </Btn>
        </motion.div>
      </div>
    </div>
  );
}
