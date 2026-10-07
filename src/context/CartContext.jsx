import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext();

const getCartKey = (designId, size) =>
  `${designId}-${size}`;

function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart =
      localStorage.getItem("itlu-sree-cart");

    if (!savedCart) {
      return [];
    }

    try {
      const parsedCart = JSON.parse(savedCart);

      // Remove old cart items created before
      // size selection was introduced.
      return parsedCart.filter(
        (item) => item.size && item.cartKey
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "itlu-sree-cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  const addToCart = (design, size) => {
    if (!size) {
      return;
    }

    const cartKey = getCartKey(
      design.id,
      size
    );

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.cartKey === cartKey
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.cartKey === cartKey
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...design,
          size,
          quantity: 1,
          cartKey,
        },
      ];
    });
  };

  const removeFromCart = (cartKey) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.cartKey !== cartKey
      )
    );
  };

  const increaseQuantity = (cartKey) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.cartKey === cartKey
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (cartKey) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.cartKey === cartKey
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

export default CartProvider;