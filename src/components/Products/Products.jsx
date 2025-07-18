import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import Modal from "react-modal";
import { getProductDetails } from "../../services/productService";
import { getOrders } from "../../services/orderService";
import "./Products.css";

const Products = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const [orderData, setOrderData] = useState(location.state?.orderData || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [scanResult, setScanResult] = useState({ success: false, message: "" });
  const [scanError, setScanError] = useState("");
  const [productImages, setProductImages] = useState({});
  const [loadingImages, setLoadingImages] = useState(true);
  const scannerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) {
      Modal.setAppElement(root);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch product images when component mounts
  useEffect(() => {
    const fetchProductImages = async () => {
      if (orderData?.line_items) {
        setLoadingImages(true);
        const imagesMap = {};

        try {
          await Promise.all(
            orderData.line_items.map(async (item) => {
              try {
                const productData = await getProductDetails(item.product_id);
                if (productData.images && productData.images.length > 0) {
                  imagesMap[item.product_id] = productData.images[0].src;
                }
              } catch (error) {
                console.error(
                  `Error fetching image for product ${item.product_id}:`,
                  error
                );
                imagesMap[item.product_id] = null;
              }
            })
          );

          setProductImages(imagesMap);
        } catch (error) {
          console.error("Error fetching product images:", error);
        } finally {
          setLoadingImages(false);
        }
      }
    };

    fetchProductImages();
  }, [orderData]);

  // Fetch order data when component mounts
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        const orders = await getOrders();
        const order = orders.find((o) => o.id.toString() === orderId);
        if (order) {
          setOrderData(order);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && !location.state?.orderData) {
      fetchOrderData();
    }
  }, [orderId, location.state?.orderData]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.error("Error clearing scanner:", error);
        }
      }
    };
  }, []);

  // Effect to initialize scanner after modal is open
  useEffect(() => {
    let scanner = null;

    const initializeScanner = async () => {
      if (isModalOpen && scannerActive && currentProductId) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 100));

          const qrReader = document.getElementById("qr-reader");
          if (!qrReader) {
            throw new Error("QR reader element not found");
          }

          scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              showTorchButtonIfSupported: true,
              showZoomSliderIfSupported: true,
              defaultZoomValueIfSupported: 2,
              verbose: false,
            },
            false
          );

          scannerRef.current = scanner;

          await scanner.render(
            (decodedText) => {
              try {
                const isMatch = decodedText === currentProductId.toString();
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
                scanner.pause();
                setScannerActive(false);
              } catch (error) {
                console.error("Error processing scan result:", error);
                setScanError({
                  en: "Error processing QR code",
                  ar: "خطأ في معالجة رمز QR",
                });
              }
            },
            (errorMessage) => {
              if (!errorMessage.includes("NotFoundException")) {
                console.warn(`QR Code scanning failed: ${errorMessage}`);
                setScanError({
                  en: "Please make sure the QR code is clearly visible",
                  ar: "يرجى التأكد من أن رمز QR واضح",
                });
              }
            }
          );
        } catch (error) {
          console.error("Error initializing scanner:", error);
          setScanError({
            en: "Failed to initialize scanner. Please try again.",
            ar: "فشل في تهيئة الماسح الضوئي. يرجى المحاولة مرة أخرى.",
          });
          setScannerActive(false);
        }
      }
    };

    initializeScanner();

    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (error) {
          console.error("Error clearing scanner:", error);
        }
      }
    };
  }, [isModalOpen, scannerActive, currentProductId]);

  const startScanning = (productId) => {
    setCurrentProductId(productId);
    setScannerActive(true);
    setIsModalOpen(true);
    setScanError("");
  };

  const closeModal = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (error) {
        console.error("Error clearing scanner:", error);
      }
      scannerRef.current = null;
    }
    setIsModalOpen(false);
    setScannerActive(false);
    setScanResult({ success: false, message: "" });
    setScanError("");
  };

  const renderProductsTable = () => (
    <div className="products-table-container">
      <table className="products-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product ID</th>
            <th>Image</th>
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
              <td>
                {loadingImages ? (
                  <div className="loading-image">Loading...</div>
                ) : productImages[product.product_id] ? (
                  <img
                    src={productImages[product.product_id]}
                    alt={product.name}
                    className="product-image"
                  />
                ) : (
                  <div className="no-image">No image</div>
                )}
              </td>
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
  );

  const renderProductsCards = () => (
    <div className="products-cards">
      {orderData.line_items.map((product) => (
        <div key={product.id} className="product-card">
          <div className="product-card-header">
            <div className="product-card-ids">
              <span className="product-card-order-id">Order #{orderId}</span>
              <span className="product-card-product-id">
                Product #{product.product_id}
              </span>
            </div>
          </div>

          {loadingImages ? (
            <div className="loading-image">Loading...</div>
          ) : productImages[product.product_id] ? (
            <img
              src={productImages[product.product_id]}
              alt={product.name}
              className="product-card-image"
            />
          ) : (
            <div className="no-image">No image</div>
          )}

          <div className="product-card-content">
            <h3 className="product-card-name">{product.name}</h3>

            <div className="product-card-field">
              <span className="product-card-label">Quantity</span>
              <span className="product-card-value">{product.quantity}</span>
            </div>

            <div className="product-card-field">
              <span className="product-card-label">Unit Price</span>
              <span className="product-card-value">
                €{(parseFloat(product.total) / product.quantity).toFixed(2)}
              </span>
            </div>

            <div className="product-card-field">
              <span className="product-card-label">Total</span>
              <span className="product-card-value">
                €{parseFloat(product.total).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="product-card-actions">
            <button
              className="qr-code-btn"
              onClick={() => startScanning(product.product_id)}
            >
              QR Code
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="products-container">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (!orderData || !orderData.line_items) {
    return (
      <div className="products-container">
        <h1>No products found for this order</h1>
        <button onClick={() => navigate("/")} className="back-btn">
          ← Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <button onClick={() => navigate("/")} className="back-btn">
          ← Back to Orders
        </button>
        <h1>Products for Order #{orderId}</h1>
      </div>

      {isMobile ? renderProductsCards() : renderProductsTable()}

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
