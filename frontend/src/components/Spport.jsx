/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

function Support() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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

  const faqCategories = [
    { id: "all", name: "All Questions", icon: "fa-solid fa-list" },
    { id: "orders", name: "Orders", icon: "fa-solid fa-cart-shopping" },
    { id: "payments", name: "Payments", icon: "fa-solid fa-credit-card" },
    { id: "shipping", name: "Shipping", icon: "fa-solid fa-truck" },
    { id: "returns", name: "Returns", icon: "fa-solid fa-rotate-left" },
    { id: "account", name: "Account", icon: "fa-solid fa-user" },
    { id: "products", name: "Products", icon: "fa-solid fa-box" },
  ];

  const faqs = [
    {
      id: 1,
      category: "orders",
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and visiting the 'My Orders' section. Click on the specific order to see real-time tracking information. You'll also receive tracking updates via email and SMS."
    },
    {
      id: 2,
      category: "orders",
      question: "Can I modify or cancel my order after placing it?",
      answer: "Orders can be modified or cancelled within 1 hour of placement. Please contact our support team immediately if you need to make changes. Once the order is processed for shipping, modifications may not be possible."
    },
    {
      id: 3,
      category: "payments",
      question: "What payment methods do you accept?",
      answer: "We accept multiple payment methods including: Credit/Debit Cards (Visa, Mastercard, American Express), bKash, Nagad, Rocket, Bank Transfer, and Cash on Delivery (for eligible orders). All payments are processed securely."
    },
    {
      id: 4,
      category: "payments",
      question: "Is it safe to use my credit card on your website?",
      answer: "Yes, absolutely. We use industry-standard SSL encryption to protect your payment information. All transactions are processed through secure payment gateways, and we never store your full credit card details on our servers."
    },
    {
      id: 5,
      category: "shipping",
      question: "How long does shipping take?",
      answer: "Shipping times vary by location. Typically, deliveries within Dhaka take 1-3 business days, and outside Dhaka take 3-7 business days. You'll receive a tracking number once your order ships."
    },
    {
      id: 6,
      category: "shipping",
      question: "Do you offer free shipping?",
      answer: "Yes, we offer free shipping on orders over ৳2000. For orders below this amount, shipping charges are calculated at checkout based on your location and delivery method."
    },
    {
      id: 7,
      category: "returns",
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for most items. Products must be unused, in original packaging, with all tags attached. Please visit our Return Policy page for detailed information on eligible items and the return process."
    },
    {
      id: 8,
      category: "returns",
      question: "How do I initiate a return?",
      answer: "To initiate a return, please contact our support team at rh189827@gmail.com with your order number and reason for return. We'll provide you with return instructions and a return authorization within 24-48 hours."
    },
    {
      id: 9,
      category: "account",
      question: "How do I create an account?",
      answer: "Click on the 'Sign Up' button at the top right corner of our website. Fill in your name, email address, and create a password. You can also sign up using your Google account for quick access."
    },
    {
      id: 10,
      category: "account",
      question: "I forgot my password. What should I do?",
      answer: "Click on 'Login' and then 'Forgot Password'. Enter your registered email address, and we'll send you instructions to reset your password. If you don't receive the email, please check your spam folder."
    },
    {
      id: 11,
      category: "products",
      question: "Are your products authentic?",
      answer: "Yes, all products on Dropore are 100% authentic. We source directly from authorized manufacturers and distributors. Every product undergoes quality checks before being listed on our platform."
    },
    {
      id: 12,
      category: "products",
      question: "What if I receive a defective product?",
      answer: "If you receive a defective or damaged product, please contact us within 48 hours of delivery with photos of the item. We'll arrange for a replacement or full refund at no additional cost to you."
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  const [openFaq, setOpenFaq] = useState(null);

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
              <i className="fa-solid fa-headset text-3xl text-white"></i>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              How Can We <span className="text-yellow-300">Help You?</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Find answers to common questions or reach out to our support team
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {faqCategories.map((category) => (
              <motion.button
                key={category.id}
                variants={itemVariants}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                  activeCategory === category.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <i className={`${category.icon} text-sm`}></i>
                <span className="text-sm">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <div className="w-20 h-1 bg-linear-to-r from-primary to-primary/50 rounded-full mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find quick answers to commonly asked questions about shopping at Dropore
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full text-left p-5 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-800 pr-4">{faq.question}</span>
                    <i className={`fa-solid fa-chevron-down text-gray-400 transition-transform duration-300 ${
                      openFaq === faq.id ? "rotate-180" : ""
                    }`}></i>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${
                    openFaq === faq.id ? "max-h-96" : "max-h-0"
                  }`}>
                    <div className="p-5 pt-0 text-gray-600 border-t border-gray-100">
                      {faq.answer}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <i className="fa-regular fa-circle-question text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No results found. Try a different search term.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Contact Options */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Still Need Help?
            </h2>
            <div className="w-20 h-1 bg-linear-to-r from-primary to-primary/50 rounded-full mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our support team is here to assist you with any questions or concerns
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-envelope text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">Send us an email and we'll respond within 24-48 hours</p>
              <a
                href="mailto:droporeofficial@gmail.com"
                className="text-primary font-medium hover:underline inline-flex items-center gap-1"
              >
                droporeofficial@gmail.com
                <i className="fa-solid fa-arrow-right text-sm"></i>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-regular fa-clock text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Chat with our support team in real-time</p>
              <button
                onClick={() => window.open("https://wa.me/8801929986172", "_blank")}
                className="bg-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition-all inline-flex items-center gap-2"
              >
                <i className="fa-brands fa-whatsapp"></i>
                Start Chat
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-regular fa-circle-question text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Help Center</h3>
              <p className="text-gray-600 mb-4">Browse our comprehensive help guides</p>
              <Link
                to="/support"
                className="text-primary font-medium hover:underline inline-flex items-center gap-1"
              >
                Visit Help Center
                <i className="fa-solid fa-arrow-right text-sm"></i>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Support Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-linear-to-r from-gray-50 to-gray-100 rounded-2xl p-8 text-center"
        >
          <i className="fa-regular fa-clock text-3xl text-primary mb-4"></i>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Support Hours</h3>
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Saturday - Thursday</span>
              <span className="font-medium text-gray-800">9:00 AM - 6:00 PM</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Friday</span>
              <span className="font-medium text-gray-800">2:00 PM - 8:00 PM</span>
            </div>
            
          </div>
          <p className="text-sm text-gray-500 mt-4">
            <i className="fa-regular fa-envelope mr-1"></i>
            Emails received outside business hours will be responded to the next business day
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Link
            to="/profile/orders"
            className="bg-white p-4 rounded-xl text-center shadow-sm hover:shadow-md transition-all border border-gray-100 group"
          >
            <i className="fa-solid fa-truck text-primary text-2xl mb-2 group-hover:scale-110 transition-transform"></i>
            <p className="text-sm font-medium text-gray-700">Track Order</p>
          </Link>
          <Link
            to="/returns"
            className="bg-white p-4 rounded-xl text-center shadow-sm hover:shadow-md transition-all border border-gray-100 group"
          >
            <i className="fa-solid fa-rotate-left text-primary text-2xl mb-2 group-hover:scale-110 transition-transform"></i>
            <p className="text-sm font-medium text-gray-700">Return Request</p>
          </Link>
          <Link
            to="/profile/orders"
            className="bg-white p-4 rounded-xl text-center shadow-sm hover:shadow-md transition-all border border-gray-100 group"
          >
            <i className="fa-solid fa-cart-shopping text-primary text-2xl mb-2 group-hover:scale-110 transition-transform"></i>
            <p className="text-sm font-medium text-gray-700">My Orders</p>
          </Link>
          <Link
            to="/contact"
            className="bg-white p-4 rounded-xl text-center shadow-sm hover:shadow-md transition-all border border-gray-100 group"
          >
            <i className="fa-solid fa-message text-primary text-2xl mb-2 group-hover:scale-110 transition-transform"></i>
            <p className="text-sm font-medium text-gray-700">Contact Us</p>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default Support;