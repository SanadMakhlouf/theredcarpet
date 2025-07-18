import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Orders from "./components/Orders/Orders";
import Products from "./components/Products/Products";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Orders />} />
          <Route path="/products/:orderId" element={<Products />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
