/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import Btn from "../components/Common/Btn";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  const contactMethods = [
    {
      icon: "fa-regular fa-envelope",
      title: "Email Us",
      description:
        "Send us an email anytime. We usually respond within 24 hours.",
      contact: "droporeofficial@gmail.com",
      link: "mailto:droporeofficial@gmail.com",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
    },
    {
      icon: "fa-brands fa-facebook",
      title: "Facebook Page",
      description: "Follow our page for updates and promotions.",
      contact: "Dropore",
      link: "https://www.facebook.com/dropore",
      color: "from-blue-600 to-blue-700",
      bgColor: "from-blue-50 to-blue-100",
    },
    {
      icon: "fa-brands fa-facebook-messenger",
      title: "Messenger Chat",
      description: "Chat with us instantly on Messenger.",
      contact: "Start Chat",
      link: "https://m.me/dropore",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "from-indigo-50 to-indigo-100",
    },
    {
      icon: "fa-brands fa-whatsapp",
      title: "WhatsApp Chat",
      description: "Reach us on WhatsApp for quick support.",
      contact: "+880 1929-986172",
      link: "https://wa.me/8801929986172",
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
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
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-primary to-primary/80 rounded-2xl mb-6 shadow-lg">
            <i className="fa-solid fa-headset text-3xl text-white"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Methods Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-primary text-lg"></i>
              Ways to Reach Us
            </h2>

            {contactMethods.map((method, index) => (
              <motion.a
                key={index}
                href={method.link}
                target={method.link.startsWith("http") ? "_blank" : undefined}
                rel={
                  method.link.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`block bg-linear-to-r ${method.bgColor} rounded-xl p-5 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-gray-200`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 bg-linear-to-r ${method.color} rounded-xl flex items-center justify-center shadow-md shrink-0`}
                  >
                    <i className={`${method.icon} text-xl text-white`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">
                      {method.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {method.description}
                    </p>
                    <p className="text-primary font-medium text-sm flex items-center gap-1">
                      {method.contact}
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                    </p>
                  </div>
                </div>
              </motion.a>
            ))}

            {/* Business Hours */}
            <motion.div
              variants={itemVariants}
              className="bg-linear-to-r from-gray-50 to-gray-100 rounded-xl p-5 mt-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                  <i className="fa-regular fa-clock text-gray-600"></i>
                </div>
                <h3 className="font-semibold text-gray-800">Business Hours</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Saturday - Thursday :</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Frinday :</span>
                  <span>2:00 PM - 8:00 PM</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <i className="fa-regular fa-paper-plane text-primary"></i>
              Send a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  placeholder="Mohammad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  placeholder="mohammad@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none"
                  placeholder="Tell us about your inquiry..."
                />
              </div>

              <Btn
              variant="outline"
                type="submit"
                disabled={isSubmitting}
                className="w-full  py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-regular fa-paper-plane"></i>
                    <span>Send Message</span>
                  </>
                )}
              </Btn>

              {/* Success Message */}
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                >
                  <i className="fa-solid fa-check-circle"></i>
                  <span>
                    Message sent successfully! We'll get back to you soon.
                  </span>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>

        {/* Map Section (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
            <div className="h-64 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <i className="fa-solid fa-map-location-dot text-5xl text-gray-400 mb-3"></i>
                <p className="text-gray-500">Interactive Map Coming Soon</p>
                <p className="text-sm text-gray-400 mt-1">Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Contact;
