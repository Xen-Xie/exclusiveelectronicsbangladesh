function StarRating({ rating, size = "sm", showNumber = false }) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-2xl",
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`fa-solid ${
            star <= rating
              ? "fa-star text-warning"
              : "fa-star text-secondary/40"
          } ${sizeClasses[size]}`}
        ></i>
      ))}
      {showNumber && (
        <span className="ml-2 text-gray-600 text-sm">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

export default StarRating;
