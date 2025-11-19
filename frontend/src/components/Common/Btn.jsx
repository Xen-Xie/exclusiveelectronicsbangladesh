/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { Link } from "react-router";
import {cn} from "../../utils/config/cn"

const Btn = ({
  to,
  children,
  onClick,
  className,
  type = "button",
  disabled,
  variant = "",
  ...props
}) => {
  //style varients
  const variants = {
  primary:
    "bg-primary text-primarybg font-inter hover:bg-accent focus:ring-2 focus:ring-[#ffffff40] hover:shadow-[0_0_12px_rgba(0,0,0,0.25)]",

  secondary:
    "bg-container text-primary border border-bordered hover:bg-[#e5e5e5] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]",

  outline:
    "border border-[--color-bordered] text-primary hover:bg-primary hover:text-primarybg hover:shadow-[0_0_10px_rgba(17,17,17,0.3)]",

  success:
    "bg-success text-primarybg hover:shadow-[0_0_12px_rgba(0,0,0,0.25)] focus:ring-2 focus:ring-[#1dbf7340]",

  danger:
    "bg-danger text-primarybg hover:shadow-[0_0_12px_rgba(0,0,0,0.25)] focus:ring-2 focus:ring-[#ef444440]",

  warning:
    "bg-warning text-primarybg hover:shadow-[0_0_12px_rgba(0,0,0,0.25)] focus:ring-2 focus:ring-[#f59e0b40]",
};

  //base styles
  const baseStyle =
    "relative overflow-hidden font-inter font-medium tracking-wide rounded-full px-6 py-2.5 text-sm md:text-base transition-all duration-300 ease-in-out group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  //overlay and text colors for hover effect
  //Colors Overlay
const overlayColors = {
  primary: "bg-primarybg",
  secondary: "bg-[#3a3a3a]",
  outline: "bg-primary",
  success: "bg-primarybg",
  danger: "bg-primarybg",
  warning: "bg-primarybg",
};

  //Text Colors on Overlay
const textOverlayColors = {
  primary: "group-hover:text-primary",
  secondary: "group-hover:text-primarybg",
  outline: "group-hover:text-primarybg",
  success: "group-hover:text-success",
  danger: "group-hover:text-danger",
  warning: "group-hover:text-warning",
};


  const buttonClass = cn(baseStyle, variants[variant], className);
  //classes for overlay and text
  const overlayClass = cn(
    "absolute inset-0 w-0 group-hover:w-full transition-all duration-300 ease-out z-0",
    overlayColors[variant]
  );
  const textClass = cn(
    "relative z-10 transition-colors duration-300",
    textOverlayColors[variant]
  );
  const content = (
    <motion.button
      onClick={(e) => {
        if (disabled) return;
        onClick && onClick(e);
      }}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={buttonClass}
      type={type}
      {...props}
    >
      {/* Button Text */}
      <span className={textClass}>{children}</span>

      {/* Overlay */}
      <span className={overlayClass} />
    </motion.button>
  );
  return to ? <Link to={to}>{content}</Link> : content;
};

export default Btn;