import React from "react";

export default function WhatsAppButton() {
  const phoneNumber = "8801833863312"; 
  const message = "Hello! I want to know more about your products.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed 
        bottom-5 
        right-5 
        w-14 
        h-14 
        bg-success 
        text-primarybg 
        rounded-full 
        flex 
        justify-center 
        items-center 
        shadow-xl 
        cursor-pointer 
        z-50
        animate-float
      "
    >
      <img
        src="/whatsapp-icon.png"
        alt="WhatsApp"
        className="object-center"
      />
    </a>
  );
}
