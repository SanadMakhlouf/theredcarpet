import axios from "axios";

const getProductDetails = async (productId) => {
  try {
    const consumerKey = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET;
    const apiurl = import.meta.env.VITE_WOOCOMMERCE_API_URL;

    const response = await axios.get(`${apiurl}/products/${productId}`, {
      auth: {
        username: consumerKey,
        password: consumerSecret,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

export { getProductDetails };
