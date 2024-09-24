// @ts-ignore

import ChapaCheckout from "../lib/chapaInline";
import { useEffect, useState } from "react";

interface ChapaPayProps {
  amount: number;
  public_key: string;
  classIdName: string;
  currency?: string;
  availablePaymentMethods?: string[];
  buttonText?: string;
  callbackUrl?: string;
  returnUrl?: string;
  styles?: string;
}

export function useChapaPay({
  amount,
  public_key,
  classIdName,
  currency = "ETB",
  availablePaymentMethods = ["telebirr", "cbebirr", "ebirr", "mpesa", "chapa"],
  buttonText = `Pay ${amount} Birr`,
  callbackUrl = "https://yourdomain.com/callback",
  returnUrl = "https://yourdomain.com/success",
  styles = '',
}: ChapaPayProps) {
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [isPaymentFailed, setIsPaymentFailed] = useState(false);
  const [error, setError] = useState(null);
  const [isPaymentClosed, setIsPaymentClosed] = useState(false);

  useEffect(() => {
    const chapa = new ChapaCheckout({
      publicKey: public_key,
      amount: amount,
      currency: currency,
      availablePaymentMethods: availablePaymentMethods,
      customizations: {
        buttonText: buttonText,
        styles: styles,
      },
      callbackUrl: callbackUrl,
      returnUrl: returnUrl,
      onSuccessfulPayment: () => {
        setIsPaymentSuccessful(true);
        setIsPaymentFailed(false);
        setIsPaymentClosed(false);
      },
      onPaymentFailure: (error: any) => {
        setError(error)
        setIsPaymentFailed(true);
        setIsPaymentSuccessful(false);
        setIsPaymentClosed(false);
      },
      onClose: () => {
        setIsPaymentClosed(true);
        setIsPaymentSuccessful(false);
        setIsPaymentFailed(false);
      },
    });

    chapa.initialize(classIdName);
  }, [
    amount,
    public_key,
    classIdName,
    currency,
    availablePaymentMethods,
    buttonText,
    callbackUrl,
    returnUrl,
    styles,
  ]);

  return { isPaymentSuccessful, isPaymentFailed, isPaymentClosed, error };
}
