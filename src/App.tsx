import "./App.css";

import { useEffect } from "react";
import { useChapaPay } from "../src/hook/useChapaPay";

function App() {
  return (
    <div>
      <ChapaPay />
    </div>
  );
}

export default App;

export function ChapaPay() {
  const chapa_poublic_key = import.meta.env.CHAPA_PUBLIC_KEY;

  const { error, isPaymentSuccessful, isPaymentFailed, isPaymentClosed } =
    useChapaPay({
      amount: 200,
      public_key: chapa_poublic_key,
      classIdName: "chapa-inline-form",
      styles: `
            .chapa-pay-button:hover { 
                background-color: green; 
                color: white;
            }
                #chapa-loading-container{
                  position: absolute;
                  top: 0%;
                  margin: 0px;
                  padding: 0px;
                  background: #ffffffdd;
                  width: 100%;
                  left: 0px;
                  backdrop-filter: blur(2px);
                  height: 100%;
                  justify-content: center;
                  align-items: center;
                  flex-direction: column;
                  border-radius: 10px;
                }
        `,
      showPaymentMethodsNames: false,
    });

  useEffect(() => {
    isPaymentSuccessful && alert("payment sucessfull");
    isPaymentFailed && alert("payment failed try again");
    isPaymentClosed && alert("payment has closed");
  }, [isPaymentSuccessful, isPaymentFailed, isPaymentClosed]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#20202020",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "10px",
          width: "25vw",
          padding: "10px",
          position: "relative",
        }}
        id="chapa-inline-form"
      ></div>
      {error}
    </div>
  );
}
