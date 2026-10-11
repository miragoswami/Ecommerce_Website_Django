import {
  createContext,
  useState,
  useEffect,
} from "react";

import api from "../services/api";


export const CartContext = createContext();


export function CartProvider({ children }) {

  const [cart, setCart] = useState([]);

  const [loading, setLoading] =
    useState(true);


  // ==========================================
  // FORMAT CART ITEMS
  // ==========================================

  const formatCartItems = (items) => {

    return items.map((item) => ({

      id:
        item.product,

      cartItemId:
        item.id,

      name:
        item.product_name,

      price:
        item.product_price,

      image:
        item.product_image,

      quantity:
        item.quantity,

    }));

  };


  // ==========================================
  // FETCH CART
  // ==========================================

  async function fetchCart() {

    const token =
      localStorage.getItem(
        "access_token"
      );


    if (!token) {

      setCart([]);

      setLoading(false);

      return;

    }


    try {

      const response =
        await api.get("cart/");


      console.log(
        "Cart from Django:",
        response.data
      );


      const items =
        response.data.items || [];


      setCart(
        formatCartItems(items)
      );


    } catch (error) {

      console.log(
        "Cart fetch error:",
        error
      );


      if (
        error.response?.status === 401
      ) {

        setCart([]);

      }

    } finally {

      setLoading(false);

    }

  }


  // ==========================================
  // LOAD CART ON APP START
  // ==========================================

  useEffect(() => {

    fetchCart();

  }, []);


  // ==========================================
  // ADD TO CART
  // ==========================================

  async function addToCart(
    product,
    quantity = 1
  ) {

    const token =
      localStorage.getItem(
        "access_token"
      );


    if (!token) {

      alert(
        "Please login to add products to cart."
      );

      return;

    }


    try {

      const response =
        await api.post(
          "cart/add/",
          {
            product:
              product.id,

            quantity:
              quantity,
          }
        );


      console.log(
        "Cart after adding:",
        response.data
      );


      const items =
        response.data.items || [];


      setCart(
        formatCartItems(items)
      );


    } catch (error) {

      console.log(
        "Add cart error:",
        error
      );


      alert(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Could not add product to cart."
      );

    }

  }


  // ==========================================
  // REMOVE ONE ITEM
  // ==========================================

  async function removeFromCart(
    productId
  ) {

    const token =
      localStorage.getItem(
        "access_token"
      );


    if (!token) {

      alert(
        "Please login first."
      );

      return;

    }


    const item = cart.find(
      (item) =>
        item.id === productId
    );


    if (!item) {

      return;

    }


    try {

      const response =
        await api.delete(
          "cart/remove/",
          {
            data: {
              item_id:
                item.cartItemId,
            },
          }
        );


      console.log(
        "Cart after removing:",
        response.data
      );


      const items =
        response.data.items || [];


      setCart(
        formatCartItems(items)
      );


    } catch (error) {

      console.log(
        "Remove cart error:",
        error
      );

    }

  }


  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  async function updateQuantity(
    productId,
    newQuantity
  ) {

    const token =
      localStorage.getItem(
        "access_token"
      );


    if (!token) {

      alert(
        "Please login first."
      );

      return;

    }


    if (newQuantity < 1) {

      await removeFromCart(
        productId
      );

      return;

    }


    const item = cart.find(
      (item) =>
        item.id === productId
    );


    if (!item) {

      return;

    }


    try {

      const response =
        await api.patch(
          "cart/update-quantity/",
          {
            item_id:
              item.cartItemId,

            quantity:
              newQuantity,
          }
        );


      console.log(
        "Cart after quantity update:",
        response.data
      );


      const items =
        response.data.items || [];


      setCart(
        formatCartItems(items)
      );


    } catch (error) {

      console.log(
        "Update quantity error:",
        error
      );

    }

  }


  // ==========================================
  // INCREASE
  // ==========================================

  function increaseQuantity(
    productId
  ) {

    const item = cart.find(
      (item) =>
        item.id === productId
    );


    if (!item) {

      return;

    }


    updateQuantity(
      productId,
      item.quantity + 1
    );

  }


  // ==========================================
  // DECREASE
  // ==========================================

  function decreaseQuantity(
    productId
  ) {

    const item = cart.find(
      (item) =>
        item.id === productId
    );


    if (!item) {

      return;

    }


    updateQuantity(
      productId,
      item.quantity - 1
    );

  }


  // ==========================================
  // CLEAR ENTIRE CART
  // ==========================================

  async function clearCart() {

    try {

      const response =
        await api.delete(
          "cart/clear/"
        );


      console.log(
        "Clear cart response:",
        response.data
      );


      // Clear React state

      setCart([]);


      console.log(
        "Cart completely cleared."
      );


    } catch (error) {

      console.log(
        "Clear cart error:",
        error
      );


      throw error;

    }

  }


  const cartCount =
    cart.reduce(
      (total, item) =>
        total +
        (item.quantity || 1),
      0
    );


  // ==========================================
  // PROVIDER
  // ==========================================

  return (

    <CartContext.Provider
      value={{

        cart,

        cartCount,

        loading,

        addToCart,

        removeFromCart,

        increaseQuantity,

        decreaseQuantity,

        clearCart,

        fetchCart,

      }}
    >

      {children}

    </CartContext.Provider>

  );

}


export default CartProvider;