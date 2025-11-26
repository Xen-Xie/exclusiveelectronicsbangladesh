import React from "react";
import { Link } from "react-router";

function TermsandConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-urbanist">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Terms and Conditions
        </h1>
        <p className="text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Overview Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">OVERVIEW</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-700 mb-4">
            This website is operated by{" "}
            <strong>Exclusive Electronics BD Ltd</strong>. The terms "We", "Us"
            and "Our" are used to refer to only Exclusive Electronics BD.
            Exclusive Electronics BD offers all information, tools and services
            which are used or concerns Exclusive Electronics BD's carrying out
            of business, and are publicly available at the website.
          </p>
          <p className="text-gray-700">
            By visiting our website and/or purchasing something from us, you
            become a user of the website and engage in our "Services". Such
            engagement will consecutively mean the user agreeing to be bound by
            the following terms and conditions.
          </p>
        </div>
      </section>

      {/* Table of Contents */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Table of Contents
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-blue-700">
          {[
            "General Conditions",
            "Availability, Pricing & Payment",
            "Products",
            "Billing & Account",
            "Discounts & Allowances",
            "Third Party Links",
            "Personal Information",
            "Errors & Inaccuracies",
            "Order Cancellation",
            "Prohibited Uses",
            "Disclaimer & Liability",
            "Indemnification",
            "Severability",
            "Termination",
            "Governing Law",
            "Changes to Terms",
            "Contact Information",
          ].map((item, index) => (
            <li key={index} className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              <a
                href={`#section-${index + 1}`}
                className="hover:text-blue-900 hover:underline"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Terms Sections */}
      <div className="space-y-8">
        {/* Section 1 */}
        <section id="section-1" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 1 – GENERAL CONDITIONS
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              By agreeing to these Terms of Service, you represent that you are
              at the age of majority in your present State or Province of
              residence, or that you have given us your consent to allow any of
              your minor dependents to use this website where you are the age of
              majority in your State or Province of residence.
            </p>
            <p>
              You may not use our products for any illegal or unauthorized
              purpose nor may you, in the use of the Service, violate any laws
              in your jurisdiction (including but not limited to copyright
              laws). You must not transmit any worms or viruses or any code of a
              destructive nature. A breach or violation of any of the Terms will
              result in an immediate termination of your Services.
            </p>
            <p>
              We reserve the right to refuse service to anyone for any reason at
              any time.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="section-2" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 2 – AVAILABILITY, PRICING AND PAYMENT METHODS
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Availability and pricing of all items are subject to availability.
              Exclusive Electronics BD will inform you as soon as possible if
              the product(s) and services you have ordered are not available.
            </p>

            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Payment Methods</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-50 rounded">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left border">
                        Payment Method
                      </th>
                      <th className="px-4 py-2 text-left border">Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border font-medium">
                        Card on Delivery
                      </td>
                      <td className="px-4 py-2 border">
                        For orders valuing more than BDT 1000 including delivery
                        cost
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border font-medium">
                        Online Payment
                      </td>
                      <td className="px-4 py-2 border">
                        Applicable for any ordered amount as per company policy
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border font-medium">
                        bKash Payment
                      </td>
                      <td className="px-4 py-2 border">
                        Applicable for any ordered amount as per company policy
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Note: For some products (Depending on Size/Price) we may ask for
                full/partial advance payment.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section id="section-3" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 3 – PRODUCTS
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              Products are available exclusively online through Exclusive
              Electronics BD. These products or services may have limited
              quantities and are subject to return or exchange only according to
              our Return and Replacement Policy.
            </p>
            <p>
              We reserve the right, but are not obligated, to limit the sales of
              our products or Services to any person, geographic region or
              jurisdiction. We may exercise this right on a case-by-case basis.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section id="section-4" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 4 – ACCURACY OF BILLING AND ACCOUNT INFORMATION
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              We reserve the right to refuse any order you place with us. We
              may, in our sole discretion, limit or cancel quantities purchased
              per person or per order.
            </p>
            <p>
              As a visitor or a customer, you agree to provide current, complete
              and accurate account information for all purchases made at our
              store.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="section-5" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 5 – DISCOUNTS & ALLOWANCES
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              Discounts and allowances (Coupon code, Promo code, Gift card code,
              Adjustment code, App discount, Occasional offers or sign-up offer
              etc.) are reductions of the basic price of products or services.
            </p>
            <p>
              Exclusive Electronics BD holds the right to change/revise/modify
              any Discount offers OR Promotional Allowances without prior
              notice.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section id="section-6" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 6 – THIRD PARTY LINKS
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              Certain content, products and services available via our Service
              may include wholly or partly, materials from third-parties only
              for the purpose of providing you with better service.
            </p>
            <p>
              We are not liable for any harm or damages related to the purchase
              or use of goods, services, resources, content, or any other
              transactions made in connection with any third-party websites.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section id="section-7" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 7 – PERSONAL INFORMATION
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              Your submission of personal information through the store is
              governed by our Privacy Policy. Please review our{" "}
              <Link
                to="/privacy-policy"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              for more information.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section id="section-8" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 8 – ERRORS, INACCURACIES AND OMISSIONS
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              Occasionally there may be information on our website containing
              typographical errors, inaccuracies or omissions that may relate to
              product descriptions, pricing, promotions, offers, and
              availability.
            </p>
            <p>
              We reserve the right to correct any errors, inaccuracies or
              omissions, and to change or update information or cancel orders if
              any information is inaccurate at any time without prior knowledge.
            </p>
          </div>
        </section>

        {/* Section 9 */}
        <section id="section-9" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 9 – ORDER CANCELLATION
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              Exclusive Electronics BD promises to deliver quality and authentic
              products to our customers. Therefore, we always run Quality
              Control checks after receiving the ordered product from the
              authorized vendors.
            </p>
            <p>
              Exclusive Electronics BD reserves all rights to cancel any order
              after finding any quality issue from Quality Control checks of the
              ordered product.
            </p>
          </div>
        </section>

        {/* Section 10 */}
        <section id="section-10" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 10 – PROHIBITED USES
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>You are prohibited from using the website or its contents:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>For any unlawful purpose</li>
              <li>To solicit others to perform unlawful acts</li>
              <li>
                To violate any international, federal, provincial or national
                regulations
              </li>
              <li>To infringe upon intellectual property rights</li>
              <li>To harass, abuse, insult, harm, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>
          </div>
        </section>

        {/* Section 11 */}
        <section id="section-11" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 11 – DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              We do not guarantee that your use of our service will be
              uninterrupted, timely, secure or error-free. You expressly agree
              that your use of the service is solely your risk.
            </p>
            <p>
              The service and all products delivered to you through the service
              are provided 'as is' and 'as available' for your use, without any
              representation or warranties of any kind.
            </p>
          </div>
        </section>

        {/* Section 12 */}
        <section id="section-12" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 12 – INDEMNIFICATION
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              As a user of the website and the services therein, you agree to
              indemnify and hold Exclusive Electronics BD harmless from any
              claim or demand made by any third-party due to or arising out of
              your breach of these Terms of Service.
            </p>
          </div>
        </section>

        {/* Section 13 */}
        <section id="section-13" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 13 – SEVERABILITY
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              In the event that any provision of these Terms of Service is
              determined to be unlawful, void or unenforceable, such provision
              shall nonetheless be enforceable to the fullest extent permitted
              by applicable law.
            </p>
          </div>
        </section>

        {/* Section 14 */}
        <section id="section-14" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 14 – TERMINATION
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              These Terms of Service are effective unless and until terminated
              by either you or us. You may terminate these Terms of Service at
              any time by notifying us that you no longer wish to use our
              Services.
            </p>
          </div>
        </section>

        {/* Section 15 */}
        <section id="section-15" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 15 – GOVERNING LAW
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              These Terms of Service and any separate agreements whereby we
              provide you Services shall be governed by and construed in
              accordance with the applicable laws governing eCommerce in
              Bangladesh.
            </p>
          </div>
        </section>

        {/* Section 16 */}
        <section id="section-16" className="border-b pb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 16 – CHANGES TO TERMS OF SERVICE
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              We reserve the right to update, change or replace any part of
              these Terms of Service by posting updates and changes to our
              website. Your continued use of our website following the posting
              of any changes constitutes acceptance of those changes.
            </p>
          </div>
        </section>

        {/* Section 17 */}
        <section id="section-17">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            SECTION 17 – CONTACT INFORMATION
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              For more information regarding the Terms of Service or if you have
              any queries or concerns, please contact us at:
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold">Email: rh189827@gmail.com</p>
              <p className="text-sm text-gray-600 mt-1">
                We typically respond to all inquiries within 24-48 hours.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Note */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center">
        <p className="text-gray-600">
          By using our website and services, you acknowledge that you have read,
          understood, and agree to be bound by these Terms and Conditions.
        </p>
      </div>
    </div>
  );
}

export default TermsandConditions;
