import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import Modal from "react-modal";
import "./Products.css";

const Products = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const orderData = location.state?.orderData;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [scanResult, setScanResult] = useState({ success: false, message: "" });
  const [scanError, setScanError] = useState("");
  const scannerRef = useRef(null);

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) {
      Modal.setAppElement(root);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const handleBack = () => {
    navigate("/");
  };

  const startScanning = (productId) => {
    setCurrentProductId(productId);
    setScannerActive(true);
    setIsModalOpen(true);
    setScanError("");

    setTimeout(() => {
      try {
        if (scannerRef.current) {
          scannerRef.current.clear();
        }

        const scanner = new Html5QrcodeScanner("qr-reader", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          formatsToSupport: [Html5QrcodeScanType.QR_CODE],
          rememberLastUsedCamera: true,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        });

        scannerRef.current = scanner;

        scanner.render(
          (decodedText) => {
            // Success callback
            const isMatch = decodedText === productId.toString();
            setScanResult({
              success: isMatch,
              message: isMatch
                ? {
                    en: "Correct! This is the right product.",
                    ar: "صحيح! هذا هو المنتج الصحيح.",
                  }
                : {
                    en: "Wrong product! This QR code doesn't match.",
                    ar: "منتج خاطئ! رمز QR هذا غير مطابق.",
                  },
            });
            scanner.clear();
            scannerRef.current = null;
            setScannerActive(false);
            setScanError("");
          },
          (errorMessage) => {
            // Ignoring the "NotFoundException" as it's just indicating no QR code is currently visible
            if (!errorMessage.includes("NotFoundException")) {
              setScanError({
                en: "Please make sure the QR code is clearly visible and well-lit",
                ar: "يرجى التأكد من أن رمز QR واضح ومضاء جيدًا",
              });
              console.warn(`QR Code scanning failed: ${errorMessage}`);
            }
          }
        );
      } catch (error) {
        console.error("Error initializing scanner:", error);
        setScanError({
          en: "Failed to start the camera. Please make sure you've granted camera permissions.",
          ar: "فشل في تشغيل الكاميرا. يرجى التأكد من منح أذونات الكاميرا.",
        });
        setScannerActive(false);
      }
    }, 100);
  };

  const closeModal = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsModalOpen(false);
    setScannerActive(false);
    setScanResult({ success: false, message: "" });
    setScanError("");
  };

  if (!orderData || !orderData.line_items) {
    return (
      <div className="products-container">
        <h1>No products found for this order</h1>
        <button onClick={handleBack} className="back-btn">
          ← Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <button onClick={handleBack} className="back-btn">
          ← Back to Orders
        </button>
        <h1>Products for Order #{orderId}</h1>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product ID</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orderData.line_items.map((product) => (
              <tr key={product.id}>
                <td>{orderId}</td>
                <td>{product.product_id}</td>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
                <td>
                  €{(parseFloat(product.total) / product.quantity).toFixed(2)}
                </td>
                <td>€{parseFloat(product.total).toFixed(2)}</td>
                <td>
                  <button
                    className="qr-code-btn"
                    onClick={() => startScanning(product.product_id)}
                  >
                    QR Code
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="qr-modal"
        overlayClassName="qr-modal-overlay"
      >
        <div className="qr-modal-content">
          <button onClick={closeModal} className="close-modal-btn">
            ×
          </button>

          {scannerActive ? (
            <>
              <h2>
                <span className="en">Scan QR Code</span>
                <br />
                <span className="ar">مسح رمز QR</span>
              </h2>
              <div id="qr-reader" className="qr-reader-container"></div>
              {scanError && (
                <div className="scan-error">
                  <p className="en">{scanError.en}</p>
                  <p className="ar">{scanError.ar}</p>
                </div>
              )}
            </>
          ) : scanResult.message ? (
            <div
              className={`scan-result ${
                scanResult.success ? "success" : "error"
              }`}
            >
              <p className="en">{scanResult.message.en}</p>
              <p className="ar">{scanResult.message.ar}</p>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
};

export default Products;
