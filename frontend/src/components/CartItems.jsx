import React from "react";
import { useCart } from "../context/useCart";
import Btn from "../components/Common/Btn";
import { useNavigate } from "react-router";

function CartItems() {
  const { cart, removeItem, updateQty, clearCart } = useCart();
  const navigate = useNavigate();

  // Calculate subtotal
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
    0
  );

  if (cart.length === 0)
    return <p className="p-5 text-center text-gray-500">Your cart is empty.</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Cart</h2>
        <Btn
          onClick={clearCart}
          disabled={cart.length === 0}
          className="text-red-500 hover:underline px-2 py-1"
        >
          Clear Cart
        </Btn>
      </div>

      {cart.map((item) => (
        <div
          key={item._id}
          className="flex flex-col xs:flex-row gap-4 border p-3 rounded-lg items-start xs:items-center"
        >
          <img
            src={
              item.image?.url ||
              item.image ||
              item.images?.[0]?.url ||
              item.images?.[0] ||
              "/placeholder.jpg"
            }
            alt={item.name}
            className="w-full xs:w-20 h-40 xs:h-20 object-cover rounded"
          />

          <div className="flex-1 w-full">
            <h3 className="font-medium">{item.name}</h3>
            <div className="flex items-center gap-3 mt-2">
              <Btn
                variant="outline"
                className="px-2 py-1 border rounded"
                onClick={() =>
                  updateQty(item._id, Math.max(1, item.quantity - 1))
                }
              >
                -
              </Btn>
              <span>{item.quantity}</span>
              <Btn
                variant="outline"
                className={`px-2 py-1 border rounded ${
                  item.quantity >= item.stock
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={item.quantity >= item.stock}
                onClick={() =>
                  updateQty(item._id, Math.min(item.stock, item.quantity + 1))
                }
              >
                +
              </Btn>
            </div>
          </div>

          <div className="w-full xs:w-auto text-right mt-3 xs:mt-0">
            <p className="font-semibold text-secondary/85">
              {item.salePrice ? (
                <>
                  <span className="line-through text-secondary/85 text-sm sm:text-base md:text-md lg:text-lg">
                    ৳{item.price * item.quantity}
                  </span>{" "}
                  <span className="text-red-500 text-xs sm:text-base md:text-md">
                    ৳{item.salePrice * item.quantity}
                  </span>{" "}
                  <span className="bg-red-500 text-white text-xs px-1 md:px-2 py-0.5 md:py-1 rounded whitespace-nowrap">
                    Save{" "}
                    {Math.round(
                      ((item.price - item.salePrice) / item.price) * 100
                    )}
                    %
                  </span>
                </>
              ) : (
                <>৳ {item.price * item.quantity}</>
              )}
            </p>
            <Btn
              variant="outline"
              onClick={() => removeItem(item._id)}
              className="hover:underline text-sm mt-1 px-2.5 py-1.5"
            >
              Remove
            </Btn>
          </div>
        </div>
      ))}

      <div className="text-right font-bold text-lg mt-4">
        Subtotal: ৳{subtotal}
      </div>

      {/* Proceed to Checkout */}
      <div className="text-right mt-4">
        <Btn
          variant="primary"
          onClick={() => navigate("/checkout")}
          className="bg-[#0A0A0A] text-primarybg py-3 px-6 rounded-lg"
        >
          Proceed to Checkout
        </Btn>
      </div>
    </div>
  );
}

export default CartItems;
