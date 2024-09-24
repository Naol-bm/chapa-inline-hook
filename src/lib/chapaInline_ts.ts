type PaymentMethods = 'telebirr' | 'cbebirr' | 'ebirr' | 'mpesa' | 'chapa' | string;

interface Customizations {
  buttonText?: string;
  styles?: string;
}

interface ChapaOptions {
  publicKey?: string;
  customizations?: Customizations;
  callbackUrl?: string;
  returnUrl?: string;
  availablePaymentMethods?: PaymentMethods[];
  assetPath?: string;
  amount: number;
  currency?: string;
  mobile?: string;
  tx_ref?: string;
  showFlag?: boolean;
  showPaymentMethodsNames?: boolean;
  onSuccessfulPayment?: (data: any) => void;
  onPaymentFailure?: (message: string) => void;
  onClose?: () => void;
}

interface PaymentMethodIcons {
  [key: string]: {
    name: string;
    icon: string;
    validPrefix?: string | string[];
  };
}

export default class ChapaCheckout {
  options: ChapaOptions;
  paymentType: PaymentMethods;
  hostedUrl: string;
  chapaUrl: string;
  verifyUrl: string;
  paymentMethodIcons: PaymentMethodIcons;
  elements: Record<string, HTMLElement>;

  constructor(options: ChapaOptions) {
    this.options = {
      publicKey: options.publicKey || "YOUR_PUBLIC_KEY_HERE",
      customizations: options.customizations || {},
      callbackUrl: options.callbackUrl,
      returnUrl: options.returnUrl,
      availablePaymentMethods: options.availablePaymentMethods || [
        "telebirr",
        "cbebirr",
        "ebirr",
        "mpesa",
      ],
      assetPath: options.assetPath || "https://assets.chapa.co/inline-assets",
      amount: options.amount,
      currency: options.currency || "ETB",
      mobile: options.mobile || "",
      tx_ref: options.tx_ref || "",
      showFlag: options.showFlag !== false,
      showPaymentMethodsNames: options.showPaymentMethodsNames !== false,
      onSuccessfulPayment: options.onSuccessfulPayment || undefined,
      onPaymentFailure: options.onPaymentFailure || undefined,
      onClose: options.onClose || undefined,
    };

    this.paymentType = this.options?.availablePaymentMethods![0];
    this.hostedUrl = "https://api.chapa.co/v1/hosted/pay";
    this.chapaUrl = "https://inline.chapaservices.net/v1/inline/charge";
    this.verifyUrl = "https://inline.chapaservices.net/v1/inline/validate";

    this.paymentMethodIcons = {
      telebirr: {
        name: "telebirr",
        icon: `${this.options.assetPath}/telebirr.svg`,
        validPrefix: "9",
      },
      cbebirr: {
        name: "CBEBirr",
        icon: `${this.options.assetPath}/cbebirr.svg`,
        validPrefix: ["9", "7"],
      },
      ebirr: {
        name: "Ebirr",
        icon: `${this.options.assetPath}/ebirr.svg`,
        validPrefix: ["9", "7"],
      },
      mpesa: {
        name: "Mpesa",
        icon: `${this.options.assetPath}/mpesa.svg`,
        validPrefix: "7",
      },
      chapa: {
        name: "Others via Chapa",
        icon: `${this.options.assetPath}/chapa.svg`,
      },
    };

    this.elements = {};
  }

  initialize(containerId = "chapa-inline-form"): void {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID ${containerId} not found.`);
      return;
    }

    container.innerHTML = `
      <div id="chapa-phone-input-container"></div>
      <div id="chapa-error-container" class="chapa-error"></div>
      <div id="chapa-payment-methods"></div>
      <button id="chapa-pay-button" type="submit"></button>
      <div id="chapa-loading-container" class="chapa-loading">
          <div class="chapa-spinner"></div>
          <p>Processing payment...</p>
          <p>Please check your phone for payment prompt.</p>
      </div>
    `;

    this.renderPhoneInput();
    this.renderPaymentMethods();
    this.renderPayButton();
    this.applyCustomStyles();
  }

  validatePhoneNumberOnInput(e: Event): boolean {
    const phoneNumber = (e.target as HTMLInputElement).value;
    const mobileRegex = /^(251\d{9}|0\d{9}|9\d{8}|7\d{8})$/;
    if (!mobileRegex.test(phoneNumber)) {
      this.showError("Please enter a valid Ethiopian phone number.");
      return false;
    } else {
      this.hideError();
    }
    return true;
  }

  renderPhoneInput(): void {
    const inputContainer = document.getElementById("chapa-phone-input-container");
    const showFlag = this.options.showFlag;

    inputContainer!.innerHTML = `
      <div class="chapa-phone-input-wrapper">
        ${
          showFlag
            ? `
        <div class="chapa-phone-prefix">
            <img src="${this.options.assetPath}/ethiopia-flag.svg" alt="Ethiopia Flag" class="chapa-flag-icon">
            <span>+251</span>
        </div>`
            : `
        <div class="chapa-phone-prefix">
            <span>+251</span>
        </div>`
        }
        <div id="phone-input-container"></div>
        <svg width="24px" height="24px" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg" id="secure">
              <path
                  d="M19.42,3.83,12.24,2h0A.67.67,0,0,0,12,2a.67.67,0,0,0-.2,0h0L4.58,3.83A2,2,0,0,0,3.07,5.92l.42,5.51a12,12,0,0,0,7.24,10.11l.88.38h0a.91.91,0,0,0,.7,0h0l.88-.38a12,12,0,0,0,7.24-10.11l.42-5.51A2,2,0,0,0,19.42,3.83ZM15.71,9.71l-4,4a1,1,0,0,1-1.42,0l-2-2a1,1,0,0,1,1.42-1.42L11,11.59l3.29-3.3a1,1,0,0,1,1.42,1.42Z"
                  style="fill:#7dc400"></path>
          </svg>
      </div>
    `;

    const phoneWrapper = document.getElementById("phone-input-container");

    const phoneInput = document.createElement("input");
    phoneInput.id = "chapa-phone-number";
    phoneInput.className = "chapa-phone-input";
    phoneInput.type = "tel";
    phoneInput.placeholder = "9|7XXXXXXXX";
    phoneInput.value = this.options.mobile!;
    phoneInput.addEventListener("input", (e) => this.validatePhoneNumberOnInput(e));
    phoneWrapper!.appendChild(phoneInput);
  }

  handlePayment(): void {
    const phoneNumber = (document.getElementById("chapa-phone-number") as HTMLInputElement).value;

    if (!this.validatePhoneNumber(phoneNumber) || !this.validatePaymentMethod()) {
      return;
    }

    const paymentData = {
      amount: this.options.amount,
      currency: this.options.currency!,
      tx_ref: this.options.tx_ref || this.generateTxRef(),
      mobile: phoneNumber,
      payment_method: this.paymentType,
    };

    this.open(paymentData);
  }

  renderPaymentMethods(): void {
    const container = document.getElementById("chapa-payment-methods")!;
    container.className = "chapa-payment-methods-grid";
    container.innerHTML = "";

    this.options.availablePaymentMethods!.forEach((method) => {
      if (this.paymentMethodIcons[method]) {
        const methodElement = this.createPaymentMethodElement(method);
        container.appendChild(methodElement);
      }
    });
  }

  createPaymentMethodElement(method: PaymentMethods): HTMLElement {
    const paymentMethod = this.paymentMethodIcons[method];
    const element = document.createElement("div");
    element.className = "chapa-payment-method";
    if (method === this.paymentType) {
      element.classList.add("chapa-selected");
    }
    element.innerHTML = `
      <img src="${paymentMethod.icon}" alt="${paymentMethod.name}" class="chapa-payment-icon">
      ${
        this.options.showPaymentMethodsNames
          ? `<span class="chapa-payment-name">${paymentMethod.name}</span>`
          : ""
      }
    `;
    element.addEventListener("click", () => this.selectPaymentMethod(method, element));
    return element;
  }

  selectPaymentMethod(method: PaymentMethods, element: HTMLElement): void {
    this.paymentType = method;
    document.querySelectorAll(".chapa-payment-method").forEach((el) => {
      el.classList.remove("chapa-selected");
    });
    element.classList.add("chapa-selected");
  }

  renderPayButton(): void {
    const payButton = document.getElementById("chapa-pay-button")!;
    payButton.className = "chapa-button";
    payButton.innerText = this.options.customizations!.buttonText || "Pay Now";
    payButton.addEventListener("click", () => this.handlePayment());
  }

  showError(message: string): void {
    const errorContainer = document.getElementById("chapa-error-container");
    errorContainer!.innerHTML = message;
    errorContainer!.classList.add("chapa-show-error");
  }

  hideError(): void {
    const errorContainer = document.getElementById("chapa-error-container");
    errorContainer!.innerHTML = "";
    errorContainer!.classList.remove("chapa-show-error");
  }

  applyCustomStyles(): void {
    if (!document.getElementById("chapa-styles")) {
      const style = document.createElement("style");
      style.id = "chapa-styles";
      style.textContent = `
                .chapa-error { display: none; color: red; margin-bottom: 10px; margin-top: 10px; }
                .chapa-loading { display: none; text-align: center; margin-top: 15px; }
                .chapa-spinner { display: inline-block; width: 30px; height: 30px; border: 3px solid rgba(0,0,0,.1); border-radius: 50%; border-top-color: #7DC400; animation: chapa-spin 1s ease-in-out infinite; }
                @keyframes chapa-spin { to { transform: rotate(360deg); } }
                .chapa-payment-methods-grid { display: flex;  gap: 8px; margin: 15px 0; justify-content:  space-between; }
                .chapa-payment-method { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; cursor: pointer; width: 60px; height: 60px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15); }
                .chapa-payment-icon { width: 42px; height: 42px; margin-bottom: 4px; }
                .chapa-payment-name { font-size: 11px; text-align: center; }
                .chapa-selected { background-color: #7dc40024; box-shadow: 0 0 0 1px #7DC400; }
                .chapa-input-wrapper { margin-bottom: 10px; ] }
                .chapa-input-wrapper label { display: block; margin-bottom: 5px; font-weight: 600; color: #333; }
                .chapa-input { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; outline: none; box-sizing: border-box; transition: border-color 0.3s, box-shadow 0.3s; }
                .chapa-input:focus { border-color: #7DC400; box-shadow: 0 0 0 3px #7dc40024; }
                .chapa-phone-input-wrapper { position: relative; margin-bottom: 20px; display: flex; align-items: center; border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px; }
                .chapa-phone-prefix { display: flex; align-items: center; padding: 0 12px; background-color: #ffffff; border-radius: 7px 0 0 7px; height: 100%; font-size: 16px; color: #6b7280; }
                .chapa-flag-icon { width: 24px; height: auto; margin-right: 8px; }
                .chapa-phone-input { width: 100%; padding: 10px; border: none; border-left: 1px solid #d1d5db;  font-size: 18px; outline: none !important; box-shadow: none !important; box-sizing: border-box; transition: border-color 0.3s, box-shadow 0.3s; }
                .chapa-phone-input-wrapper:hover { border-color: #7DC400; box-shadow: 0 0 0 3px #7dc40024; }
                .chapa-phone-input-wrapper:hover .chapa-phone-input { border-color: #7DC400; box-shadow: 0 0 0 3px #7dc40024; }
                .chapa-pay-button { background-color: #7DC400; color: #FFFFFF; border: none; border-radius: 4px; padding: 10px; font-size: 16px; cursor: pointer; width: 100%; transition: background-color 0.3s; }
                .chapa-pay-button:hover { background-color: #6baf00; }
                #phone-input-container { width: 100%; }
            `;
      document.head.appendChild(style);
    }

    if (this.options?.customizations?.styles) {
      const customStyle = document.createElement("style");
      customStyle.textContent = this.options.customizations.styles;
      document.head.appendChild(customStyle);
    }
  }


  
  validatePhoneNumber(phoneNumber: string): boolean {
    const mobileRegex = /^(251\d{9}|0\d{9}|9\d{8}|7\d{8})$/;
    if (!mobileRegex.test(phoneNumber)) {
      this.showError("Invalid phone number. Must be an Ethiopian number.");
      return false;
    }
    this.hideError();
    return true;
  }

  validatePaymentMethod(): boolean {
    if (!this.paymentType) {
      this.showError("Please select a payment method.");
      return false;
    }
    return true;
  }

  generateTxRef(): string {
    return `TX-${Date.now()}`;
  }

  open(paymentData: any): void {
    this.showLoading();
    fetch(this.chapaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.options.publicKey}`,
      },
      body: JSON.stringify(paymentData),
    })
      .then((response) => response.json())
      .then((data) => {
        this.hideLoading();
        if (data.status === "success") {
          this.options.onSuccessfulPayment && this.options.onSuccessfulPayment(data);
        } else {
          this.options.onPaymentFailure && this.options.onPaymentFailure(data.message);
        }
      })
      .catch((error) => {
        this.hideLoading();
        this.options.onPaymentFailure && this.options.onPaymentFailure(error.message);
      });
  }

  showLoading(): void {
    const loadingContainer = document.getElementById("chapa-loading-container")!;
    loadingContainer.classList.add("chapa-show-loading");
  }

  hideLoading(): void {
    const loadingContainer = document.getElementById("chapa-loading-container")!;
    loadingContainer.classList.remove("chapa-show-loading");
  }
}
