import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

function QRScanner({ onScan, onError }) {
  const scannerRef = useRef(null);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    const qrScanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    qrScanner.render(
      (decodedText, decodedResult) => {
        // Success callback
        if (onScan) {
          onScan(decodedText, decodedResult);
        }
      },
      (error) => {
        // Error callback (can be noisy, so we filter)
        if (error && !error.includes("NotFoundException")) {
          console.warn("QR Scan Error:", error);
        }
      }
    );

    setScanner(qrScanner);

    return () => {
      if (qrScanner) {
        qrScanner
          .clear()
          .catch((err) => console.error("Failed to clear scanner:", err));
      }
    };
  }, [onScan, onError]);

  return (
    <div>
      <div id="qr-reader" ref={scannerRef}></div>
    </div>
  );
}

export default QRScanner;
