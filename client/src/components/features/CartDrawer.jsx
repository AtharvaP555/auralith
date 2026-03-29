import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import useCartStore from "../../store/cartStore";

const CartDrawer = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getTotalPrice,
  } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={closeCart} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-gray-700" />
            <h2 className="text-base font-semibold text-gray-900">
              Cart ({items.length})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
            <ShoppingCart size={48} className="text-gray-200" />
            <p className="text-gray-400 text-sm">Your cart is empty</p>
            <button
              onClick={closeCart}
              className="text-sm text-gray-900 underline"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                    <img
                      src={
                        item.images?.[0] || "https://placehold.co/64x64?text=?"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      ${parseFloat(item.price).toFixed(2)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={12} className="text-gray-500" />
                        </button>
                        <span className="px-2 text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={12} className="text-gray-500" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-gray-900 shrink-0">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-base font-semibold text-gray-900">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>

              <Link
                to="/checkout"
                onClick={closeCart}
                className="block w-full bg-gray-900 text-white text-center py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Checkout
              </Link>

              <button
                onClick={closeCart}
                className="block w-full text-center text-sm text-gray-500 hover:text-gray-900 transition-colors mt-3"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
