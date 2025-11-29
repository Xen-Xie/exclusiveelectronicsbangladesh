/* eslint-disable no-unused-vars */
import React from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import Btn from "../components/Common/Btn";

function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-6 font-urbanist">
      <div className="max-w-lg w-full text-center">
        {/* Modern Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="mb-8"
        >
          <div className="relative w-48 h-48 mx-auto">
            {/* Main circle */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-purple-500 rounded-full shadow-2xl shadow-blue-500/30 dark:shadow-blue-500/10" />

            {/* Inner design */}
            <div className="absolute inset-4 bg-white/10 rounded-full backdrop-blur-sm border border-white/20" />

            {/* 404 Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">404</span>
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity },
              }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full shadow-lg"
            />
            <motion.div
              animate={{
                rotate: -360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity },
              }}
              className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full shadow-lg"
            />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Lost in Space
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
              The page you're looking for seems to have drifted off into the
              digital cosmos.
            </p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <i className="fa-solid fa-rocket" />
                Launch Home
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Btn
                variant="outline"
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-3 px-8 py-4 text-primarybg font-medium rounded-2xl hover:shadow-lg transition-all duration-200"
              >
                <i className="fa-solid fa-arrow-rotate-left" />
                Go Back
              </Btn>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default ErrorPage;
