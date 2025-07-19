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
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();
    const id = order.id.toString().toLowerCase();
    const customer = (
      order.billing.first_name +
      " " +
      order.billing.last_name
    ).toLowerCase();
    const status = order.status.toLowerCase();

    const matchesSearch =
      id.includes(search) ||
      customer.includes(search) ||
      status.includes(search);

    const matchesStatus =
      statusFilter === "All statuses" ||
      order.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleSeeProducts = (orderId) => {
    navigate(`/products/${orderId}`);
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading-container">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchOrders}>Try Again</button>
        </div>
      </div>
    );
  }

  const renderOrdersTable = () => (
    <div className="orders-table-container">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{`${order.billing.first_name} ${order.billing.last_name}`}</td>
              <td>{new Date(order.date_created).toLocaleDateString()}</td>
              <td>
                <span className={`status-badge ${order.status}`}>
                  {order.status}
                </span>
              </td>
              <td>{order.payment_method_title}</td>
              <td>
                <button
                  className="see-products-btn"
                  onClick={() => handleSeeProducts(order.id)}
                >
                  See Products
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderOrdersCards = () => (
    <div className="orders-cards">
      {filteredOrders.map((order) => (
        <div key={order.id} className="order-card">
          <div className="order-card-header">
            <span className="order-card-id">Order #{order.id}</span>
            <span className="order-card-date">
              {new Date(order.date_created).toLocaleDateString()}
            </span>
          </div>
          <div className="order-card-content">
            <div className="order-card-field">
              <span className="order-card-label">Customer</span>
              <span className="order-card-value">
                {`${order.billing.first_name} ${order.billing.last_name}`}
              </span>
            </div>
            <div className="order-card-field">
              <span className="order-card-label">Status</span>
              <span className={`status-badge ${order.status}`}>
                {order.status}
              </span>
            </div>
            <div className="order-card-field">
              <span className="order-card-label">Payment</span>
              <span className="order-card-value">
                {order.payment_method_title}
              </span>
            </div>
          </div>
          <div className="order-card-actions">
            <button
              className="see-products-btn"
              onClick={() => handleSeeProducts(order.id)}
            >
              See Products
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="orders-container">
      <div className="orders-header">
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
      </div>

      <div className="filters-container">
        <div className="filter">
          <label>Status:</label>
          <select value={statusFilter} onChange={handleStatusChange}>
            <option>All statuses</option>
            <option>Processing</option>
            <option>Completed</option>
            <option>Cancelled</option>
            <option>Refunded</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found matching your criteria.</p>
        </div>
      ) : isMobile ? (
        renderOrdersCards()
      ) : (
        renderOrdersTable()
      )}
    </div>
  );
};

export default Orders;
