import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Orders.css";
import { getOrders } from "../../services/orderService.js";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Last 30 days");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch orders when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Function to fetch orders from the API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch orders. Please try again later.");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleDateChange = (e) => {
    setDateFilter(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "status-delivered";
      case "shipped":
        return "status-shipped";
      case "processing":
        return "status-processing";
      case "pending":
        return "status-pending";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const handleSeeProducts = (order) => {
    // Pass the entire order object through navigation state
    navigate(`/products/${order.id}`, { state: { orderData: order } });
  };

  // Filter orders based on search term and filters
  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();

    // ID comme string
    const id = order.id.toString().toLowerCase();

    // Nom complet du client
    const customer = (
      order.billing.first_name +
      " " +
      order.billing.last_name
    ).toLowerCase();

    // Statut en minuscules
    const status = order.status.toLowerCase();

    // Recherche dans id, customer ou statut
    const matchesSearch =
      id.includes(search) ||
      customer.includes(search) ||
      status.includes(search);

    // Filtre par statut (si "All statuses", on accepte tout)
    const matchesStatus =
      statusFilter === "All statuses" ||
      order.status.toLowerCase() === statusFilter.toLowerCase();

    // TODO: Ajouter filtre par date plus tard

    return matchesSearch && matchesStatus;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="orders-container">
        <header className="orders-header">
          <h1>Orders</h1>
        </header>
        <div className="loading-container">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="orders-container">
        <header className="orders-header">
          <h1>Orders</h1>
        </header>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchOrders}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <header className="orders-header">
        <h1>Orders</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </header>

      <div className="filters-container">
        <div className="filter">
          <label>Status:</label>
          <select value={statusFilter} onChange={handleStatusChange}>
            <option>All statuses</option>
            <option>Delivered</option>
            <option>Shipped</option>
            <option>Processing</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
        </div>

        <div className="filter">
          <label>Date:</label>
          <select value={dateFilter} onChange={handleDateChange}>
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Today</option>
            <option>This month</option>
            <option>Last month</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found matching your criteria.</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{new Date(order.date_created).toLocaleDateString()}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-avatar"></div>
                      <span>
                        {order.billing.first_name +
                          " " +
                          order.billing.last_name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{order.payment_method_title}</td>
                  <td>{order.total}</td>
                  <td>
                    <button
                      className="see-products-btn"
                      onClick={() => handleSeeProducts(order)}
                    >
                      See Products
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
