import { useEffect } from "react";
import { useChapaPay } from "../hook/useChapaPay";

function ChapaPay() {
  const { error, isPaymentSuccessful, isPaymentFailed, isPaymentClosed } =
    useChapaPay({
      amount: 200,
      public_key: "abd",
      classIdName: "chapa-inline-form",
    });

  useEffect(() => {
    isPaymentSuccessful && alert("paymnet sucessfull");
    isPaymentFailed && alert("paymnet failed try again");
    isPaymentClosed && alert("paymnet has closed");
  }, [isPaymentSuccessful, isPaymentFailed, isPaymentClosed]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "10px",
          width: "30vw",
          padding: "10px",
        }}
        id="chapa-inline-form"
      ></div>
      {error}
    </div>
  );
}

export default ChapaPay;
