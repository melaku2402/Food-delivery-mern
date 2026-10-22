import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import "./Verify.css";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const { url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await axios.post(url + "/api/order/verify", {
          success,
          orderId,
        });
        if (response.data.success) {
          navigate("/myorders");
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error("Payment verification failed:", err);
        setError("Could not verify payment. Please check your orders or contact support.");
      }
    };

    verifyPayment();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="verify">
        <p style={{ color: "red", textAlign: "center", padding: "2rem" }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="verify">
      <div className="spinner"></div>
    </div>
  );
};

export default Verify;
