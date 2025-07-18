import { config } from "../config/env.js";
import axios from "axios";

// Mock data for development


// Function to get all orders
export const getOrders = async () => {
  console.log("getOrders() called ✅");

  try {
    const consumerKey = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET;
    const perPage = import.meta.env.VITE_ORDERS_PER_PAGE;
    const apiurl = import.meta.env.VITE_WOOCOMMERCE_API_URL;

    const response = await axios.get(`${apiurl}/orders`, {
      auth: {
        username: consumerKey,
        password: consumerSecret,
      },
      params: {
        per_page: perPage,
      },
    });

    console.log("API response received ✅");

    // response.data.forEach((order) => {
    //   console.log("Order ID:", order.id);
    // });

    return response.data; // ✅ ce retour est essentiel
  } catch (error) {
    console.error(
      "Error fetching orders:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Function to get order by ID
export const getOrderById = async (orderId) => {
  try {
    // When API is ready, uncomment this code
    // const response = await fetch(`${config.api.url}/orders/${orderId}`)
    // const data = await response.json()
    // return data

    // For now, use mock data

  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

// Function to create a new order
export const createOrder = async (orderData) => {
  try {
    // When API is ready, uncomment this code
    // const response = await fetch(`${config.api.url}/orders`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(orderData),
    // })
    // const data = await response.json()
    // return data

    // For now, simulate API call with mock data
   
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Function to update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    // When API is ready, uncomment this code
    // const response = await fetch(`${config.api.url}/orders/${orderId}/status`, {
    //   method: 'PATCH',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ status }),
    // })
    // const data = await response.json()
    // return data

    // For now, use mock data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orderIndex = mockOrders.findIndex(
          (order) => order.id === orderId
        );
        if (orderIndex !== -1) {
          mockOrders[orderIndex].status = status;
          resolve(mockOrders[orderIndex]);
        } else {
          reject(new Error("Order not found"));
        }
      }, 500);
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};
