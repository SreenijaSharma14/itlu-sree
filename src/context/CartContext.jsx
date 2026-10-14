
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import designs from "../data/designs";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const getCartKey = (designId, size) =>
  `${designId}-${size}`;

const designIdsByName = new Map(
  designs.map((design) => [design.name, design.id])
);

function normalizeCart(items) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item.size && item.cartKey)
    .map((item) => {
      const designId = designIdsByName.get(item.name);

      if (!designId || designId === item.id) {
        return item;
      }

      return {
        ...item,
        id: designId,
        cartKey: getCartKey(designId, item.size),
      };
    });
}

function getLocalCart() {
  try {
    return normalizeCart(
      JSON.parse(
        localStorage.getItem("itlu-sree-cart") || "[]"
      )
    );
  } catch {
    return [];
  }
}

function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [cart, setCart] = useState(getLocalCart);
  const [cartLoading, setCartLoading] = useState(false);
  const [activeUserId, setActiveUserId] = useState(null);

  const cartRef = useRef(cart);
  const loadVersion = useRef(0);
  const saveVersion = useRef(0);
  const readyUserId = useRef(null);

  // Keep the latest cart available to async operations.
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Load the signed-in user's cart from Supabase.
  useEffect(() => {
    if (authLoading) return;

    const version = ++loadVersion.current;
    let cancelled = false;

    readyUserId.current = null;
    setActiveUserId(null);

    if (!user) {
      setCart(getLocalCart());
      setCartLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setCart([]);
    setCartLoading(true);

    const loadCart = async () => {
      const { data, error } = await supabase
        .from("user_carts")
        .select("items")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled || version !== loadVersion.current) return;

      if (error) {
        console.error("Cart loading failed:", error);
        setCartLoading(false);
        return;
      }

      const savedItems = normalizeCart(data?.items ?? []);

      cartRef.current = savedItems;
      setCart(savedItems);
      setActiveUserId(user.id);
      readyUserId.current = user.id;
      setCartLoading(false);
    };

    loadCart();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading]);

  // Save changes to the signed-in user's cart.
  useEffect(() => {
    if (
      !user ||
      authLoading ||
      activeUserId !== user.id ||
      readyUserId.current !== user.id
    ) {
      return;
    }

    const version = ++saveVersion.current;
    const items = cart;

    const saveTimer = setTimeout(async () => {
      const { error } = await supabase
        .from("user_carts")
        .upsert(
          {
            user_id: user.id,
            items,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Cart saving failed:", error);
      }
    }, 300);

    return () => {
      clearTimeout(saveTimer);
    };
  }, [cart, user?.id, activeUserId, authLoading]);

  // Receive cart changes made on another device.
  useEffect(() => {
    if (!user || activeUserId !== user.id) return;

    const channel = supabase
      .channel(`cart-sync-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_carts",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") return;

          const incoming = normalizeCart(
            payload.new?.items ?? []
          );

          if (
            JSON.stringify(incoming) !==
            JSON.stringify(cartRef.current)
          ) {
            cartRef.current = incoming;
            setCart(incoming);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, activeUserId]);

  // Keep browser storage for guests only.
  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem(
        "itlu-sree-cart",
        JSON.stringify(cart)
      );
    }
  }, [cart, user?.id, authLoading]);

  const addToCart = (design, size) => {
    if (!size) return;

    const cartKey = getCartKey(design.id, size);

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.cartKey === cartKey
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        { ...design, size, quantity: 1, cartKey },
      ];
    });
  };

  const removeFromCart = (cartKey) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.cartKey !== cartKey)
    );
  };

  const increaseQuantity = (cartKey) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.cartKey === cartKey
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (cartKey) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
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
