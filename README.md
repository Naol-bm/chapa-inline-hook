# Chapa Inline Hook

`chapa-inline-hook` is a React hook for integrating the Chapa payment gateway into your React applications. This hook simplifies the setup and management of payment processes using Chapa's service, handling payment success, failure, and errors efficiently.

## Installation

You can install the library via npm or yarn:

```bash
npm install chapa-inline-hook
```

or

```bash
yarn add chapa-inline-hook
```

## Usage

To use the `useChapaPay` hook, import it into your React component and call it with the required parameters.

### Example-1

```tsx
import React from "react";
import { useChapaPay } from "chapa-inline-hook";

const PaymentPage = () => {
  const { error, isPaymentSuccessful, isPaymentFailed, isPaymentClosed } =
    useChapaPay({
      amount: 500,
      public_key: "your-public-key-here",
      classIdName: "chapa-inline-form",
    });

  return (
    <div>
      <h1>Make a Payment</h1>
      <div id="chapa-inline-form"></div>
      {isPaymentSuccessful && <p>Payment was successful!</p>}
      {isPaymentFailed && <p>Payment failed. Please try again.</p>}
      {isPaymentClosed && <p>Payment window was closed.</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}{" "}
      {/* Display error message */}
    </div>
  );
};

export default PaymentPage;
```

### Example-2-with-custome-style

```tsx
import React from "react";
import { useChapaPay } from "chapa-inline-hook";

export function PaymentPage() {
  const { error, isPaymentSuccessful, isPaymentFailed, isPaymentClosed } =
    useChapaPay({
      amount: 200,
      public_key: "your_chapa_public_key",
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
      {/* {error} */}
    </div>
  );
}
```

## Above example preview

https://github.com/user-attachments/assets/b6b35826-9e5d-4903-b6d4-657613f7d570

## API

### `useChapaPay`

This hook sets up the Chapa payment process and provides payment status indicators.

#### Parameters

| Parameter                 | Type       | Description                                                                                                                                     |
| ------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `amount`                  | `number`   | The amount to be paid (in the smallest currency unit, e.g., cents).                                                                             |
| `public_key`              | `string`   | Your Chapa public key for authentication.                                                                                                       |
| `classIdName`             | `string`   | The class name or ID of the DOM element where the payment button will be rendered.                                                              |
| `currency`                | `string`   | (Optional) Currency code, defaults to `"ETB"`.                                                                                                  |
| `availablePaymentMethods` | `string[]` | (Optional) Array of payment methods to be made available for the transaction. Defaults to `["telebirr", "cbebirr", "ebirr", "mpesa", "chapa"]`. |
| `buttonText`              | `string`   | (Optional) Custom text for the payment button, defaults to `Pay ${amount} Birr`.                                                                |
| `callbackUrl`             | `string`   | (Optional) The URL to redirect to after a successful payment.                                                                                   |
| `returnUrl`               | `string`   | (Optional) The URL to redirect to after payment completion.                                                                                     |
| `styles`                  | `string`   | (Optional) Custom CSS styles for the payment button.                                                                                            |

#### Returns

| Return Value          | Type      | Description                                   |
| --------------------- | --------- | --------------------------------------------- |
| `isPaymentSuccessful` | `boolean` | Indicates if the payment was successful.      |
| `isPaymentFailed`     | `boolean` | Indicates if the payment has failed.          |
| `isPaymentClosed`     | `boolean` | Indicates if the payment window was closed.   |
| `error`               | `string`  | Contains error messages if the payment fails. |

### Example of Custom Callbacks

If you want to handle payment events, you can use returned values:

```tsx
const { isPaymentSuccessful, isPaymentFailed, isPaymentClosed, error } =
  useChapaPay({
    amount: 500,
    public_key: "your-public-key-here",
    classIdName: "pay-button-container",
  });

isPaymentSuccessful && alert("Payment successful!");
isPaymentFailed && alert(error);
isPaymentClosed && alert("Payment has closed");
```
