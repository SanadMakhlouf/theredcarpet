export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || "The Red Carpet",
  },
  api: {
    url: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  },
  features: {
    enableNewOrder: import.meta.env.VITE_ENABLE_NEW_ORDER === "true",
    enableOrderFilters: import.meta.env.VITE_ENABLE_ORDER_FILTERS === "true",
  },
  pagination: {
    ordersPerPage: parseInt(import.meta.env.VITE_ORDERS_PER_PAGE) || 5,
  },
};
