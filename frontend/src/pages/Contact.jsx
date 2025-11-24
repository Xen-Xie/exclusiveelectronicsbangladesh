import React from "react";

function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6 text-center">Contact Us</h1>

      <p className="text-gray-700 text-center mb-8">
        If you have any questions, concerns, or business inquiries, feel free to
        reach out to us using the options below.
      </p>

      {/* Email Section */}
      <div className="bg-gray-100 p-5 rounded-lg mb-6">
        <h2 className="text-xl font-medium mb-2">Email Us</h2>
        <p className="mb-3 text-gray-700">
          Send us an email anytime. We usually respond within 24 hours.
        </p>
        <a href="mailto:rh189827@gmail.com" className="text-primary underline">
          rh189827@gmail.com
        </a>
      </div>

      {/* Social Contact */}
      <div className="bg-gray-100 p-5 rounded-lg space-y-3">
        <h2 className="text-xl font-medium">Other Ways to Contact</h2>

        <a
          href="https://www.facebook.com/exclusiveelectronics"
          target="_blank"
          className="block text-primary underline"
        >
          Facebook Page
        </a>

        <a
          href="https://m.me/"
          target="_blank"
          className="block text-primary underline"
        >
          Messenger Chat
        </a>

        <a
          href="https://wa.me/8801833863312"
          target="_blank"
          className="block text-primary underline"
        >
          WhatsApp Chat
        </a>
      </div>
    </div>
  );
}

export default Contact;
