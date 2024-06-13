document.addEventListener('DOMContentLoaded', () => {
    const cartButton = document.getElementById('cart-button');
    const cartCount = document.getElementById('cart-count');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementsByClassName('close')[0];
    const continueButton = document.getElementById('continue-button');
    const checkoutSection = document.getElementById('checkout');
    const cartItemsList = document.getElementById('cart-items');
    const totalAmount = document.getElementById('total-amount');
    const payButton = document.getElementById('pay-button');

    let cart = [];

    const products = [
        { id: 1, name: 'Producto 1', price: 1 },
        { id: 2, name: 'Producto 2', price: 2 },
        { id: 3, name: 'Producto 3', price: 3 },
        { id: 4, name: 'Producto 4', price: 4 },
        { id: 5, name: 'Producto 5', price: 5 },
        { id: 6, name: 'Producto 6', price: 6 },
        { id: 7, name: 'Producto 7', price: 7 },
        { id: 8, name: 'Producto 8', price: 8 },
    ];
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productId = parseInt(button.dataset.id);
            const product = products.find(p => p.id === productId);

            cart.push(product);
            cartCount.innerText = cart.length;

            showToast();
        });
    });

    function showToast() {
        const toast = document.getElementById('toast');
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    cartButton.addEventListener('click', () => {
        modal.style.display = 'block';

        const paymentMethod = document.getElementById('payment-method').value;
        document.getElementById(paymentMethod + '_form').style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    document.getElementById('payment-method').addEventListener('change', function() {
        document.querySelectorAll('.config_form').forEach(configForm => {
            configForm.style.display = 'none';
        });

        document.getElementById(this.value + '_form').style.display = 'flex';
    });

        fetch('/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "signature": "QtHtx7geMcgjD0dH90eUaoIQ",
                "amount": parseFloat(totalAmount.innerText) * 100,
                "operative": "AUTHORIZATION",
                "secure": true,
                "description": "Checkout SDK Test",
                "service": "CC7C69E8-8B64-4BBE-A2DA-50A689E31288",
                "extra_data": {"checkout": {"uuid": "11BDB7BD-A93A-43D5-B17F-879877B45E08"}}
            })
        })
            .then(response => response.json())
            .then(async data => {
                document.getElementById('payment-iframe').innerHTML = "";

                const paymentMethod = document.getElementById('payment-method').value;

                if (paymentMethod === "redirect") {
                    await paylandsCheckout.redirect();
                } else if (paymentMethod === "render") {
                    await paylandsCheckout.render('checkout');
                } else if (paymentMethod === "payment_card") {
                    await paylandsCheckout.card({
                        container: "payment-iframe",
                        form: {
                            holderLabel: document.getElementById('holder-label').value,
                            holderError: document.getElementById('holder-error').value,
                            panLabel: document.getElementById('pan-label').value,
                            panError: document.getElementById('pan-error').value,
                            expiryLabel: document.getElementById('expiry-label').value,
                            expiryError: document.getElementById('expiry-error').value,
                            cvvLabel: document.getElementById('cvv-label').value,
                            cvvError: document.getElementById('cvv-error').value,
                        },
                        customization: {
                            font: document.getElementById('font').value,
                            textColor: document.getElementById('text-color').value,
                            backgroundColor: document.getElementById('background-color').value,
                            errorColor: document.getElementById('error-color').value,
                            borderColor: document.getElementById('border-color').value,
                            borderRadius: document.getElementById('border-radius').value,
                            padding: document.getElementById('padding').value,
                            inputTextSize: document.getElementById('input-text-size').value,
                            labelTextSize: document.getElementById('label-text-size').value,
                            iconSize: "20px",
                            iconColor: document.getElementById('icon-color').value,
                        }
                    });

                    document.getElementById('payment-iframe').style.height = "190px";

                    window.addEventListener('message', event => {
                        if (event.data.card_valid === 1) {
                            payButton.classList.remove('disabled');
                        }

                        if (event.data.card_valid === 0) {
                            payButton.classList.add('disabled');
                        }
                    });

                    payButton.addEventListener("click", () => {
                        window.postMessage({ pay: "card" });
                    });
                } else if (paymentMethod === "wallets") {
                    payButton.style.display = "none";
                    await paylandsCheckout.google_pay('payment-iframe');
                } else if (paymentMethod === "paypal") {
                    payButton.style.display = "none";
                    await paylandsCheckout.payPal({
                        container: 'payment-iframe',
                        form: {
                            prefilledAddress: document.getElementById(paymentMethod + '-prefilled-address').value,
                            prefilledCountry: document.getElementById(paymentMethod + '-prefilled-country').value,
                        },
                        customization: {
                            layout: document.getElementById('layout').value,
                            color: document.getElementById('color').value,
                            label: document.getElementById('label').value,
                            borderRadius: parseFloat(document.getElementById('borderRadius').value),
                        }
                    });
                } else if (paymentMethod === "bizum") {
                    await paylandsCheckout.bizum({
                        container: 'payment-iframe',
                        form: {
                            prefixLabel: document.getElementById(paymentMethod + '-prefix-label').value,
                            prefixError: document.getElementById(paymentMethod + '-prefix-error').value,
                            phoneLabel: document.getElementById(paymentMethod + '-phone-label').value,
                            phoneError: document.getElementById(paymentMethod + '-phone-error').value,
                            prefilledPrefix: document.getElementById(paymentMethod + '-prefilled-prefix').value,
                            prefilledPhone: document.getElementById(paymentMethod + '-prefilled-phone').value,
                        },
                        customization: {
                            font: document.getElementById(paymentMethod + '-font').value,
                            textColor: document.getElementById(paymentMethod + '-text-color').value,
                            backgroundColor: document.getElementById(paymentMethod + '-background-color').value,
                            errorColor: document.getElementById(paymentMethod + '-error-color').value,
                            borderColor: document.getElementById(paymentMethod + '-border-color').value,
                            borderRadius: document.getElementById(paymentMethod + '-border-radius').value,
                            padding: document.getElementById(paymentMethod + '-padding').value,
                            inputTextSize: document.getElementById(paymentMethod + '-input-text-size').value,
                            labelTextSize: document.getElementById(paymentMethod + '-label-text-size').value,
                            iconSize: "20px",
                            iconColor: document.getElementById(paymentMethod + '-icon-color').value,
                        }
                    });

                    document.getElementById('payment-iframe').style.height = "70px";

                    window.addEventListener('message', event => {
                        if (event.data.bizum_valid === true) {
                            payButton.classList.remove('disabled');
                        }

                        if (event.data.bizum_valid === false) {
                            payButton.classList.add('disabled');
                        }
                    });

                    payButton.addEventListener("click", () => {
                        window.postMessage({ pay: paymentMethod });
                    });
                } else if (paymentMethod === "cofidis") {
                    await paylandsCheckout.cofidis({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: document.getElementById(paymentMethod + '-name-label').value,
                            nameError: document.getElementById(paymentMethod + '-name-error').value,
                            lastNameLabel: document.getElementById(paymentMethod + '-lastname-label').value,
                            lastNameError: document.getElementById(paymentMethod + '-lastname-error').value,
                            emailLabel: document.getElementById(paymentMethod + '-email-label').value,
                            emailError: document.getElementById(paymentMethod + '-email-error').value,
                            prefilledName: document.getElementById(paymentMethod + '-prefilled-name').value,
                            prefilledLastName: document.getElementById(paymentMethod + '-prefilled-lastname').value,
                            prefilledEmail: document.getElementById(paymentMethod + '-prefilled-email').value,
                        },
                        customization: {
                            font: document.getElementById(paymentMethod + '-font').value,
                            textColor: document.getElementById(paymentMethod + '-text-color').value,
                            backgroundColor: document.getElementById(paymentMethod + '-background-color').value,
                            errorColor: document.getElementById(paymentMethod + '-error-color').value,
                            borderColor: document.getElementById(paymentMethod + '-border-color').value,
                            borderRadius: document.getElementById(paymentMethod + '-border-radius').value,
                            padding: document.getElementById(paymentMethod + '-padding').value,
                            inputTextSize: document.getElementById(paymentMethod + '-input-text-size').value,
                            labelTextSize: document.getElementById(paymentMethod + '-label-text-size').value,
                            iconSize: "20px",
                            iconColor: document.getElementById(paymentMethod + '-icon-color').value,
                        }
                    });

                    document.getElementById('payment-iframe').style.height = "140px";

                    window.addEventListener('message', event => {
                        if (event.data.cofidis_valid === true) {
                            payButton.classList.remove('disabled');
                        }

                        if (event.data.cofidis_valid === false) {
                            payButton.classList.add('disabled');
                        }
                    });

                    payButton.addEventListener("click", () => {
                        window.postMessage({ pay: paymentMethod });
                    });
                } else if (paymentMethod === "giropay") {
                    await paylandsCheckout.giropay({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: document.getElementById(paymentMethod + '-name-label').value,
                            nameError: document.getElementById(paymentMethod + '-name-error').value,
                            lastNameLabel: document.getElementById(paymentMethod + '-lastname-label').value,
                            lastNameError: document.getElementById(paymentMethod + '-lastname-error').value,
                            emailLabel: document.getElementById(paymentMethod + '-email-label').value,
                            emailError: document.getElementById(paymentMethod + '-email-error').value,
                            addressLabel: document.getElementById(paymentMethod + '-address-label').value,
                            addressError: document.getElementById(paymentMethod + '-address-error').value,
                            zipCodeLabel: document.getElementById(paymentMethod + '-zipcode-label').value,
                            zipCodeError: document.getElementById(paymentMethod + '-zipcode-error').value,
                            cityLabel: document.getElementById(paymentMethod + '-city-label').value,
                            cityError: document.getElementById(paymentMethod + '-city-error').value,
                            countryLabel: document.getElementById(paymentMethod + '-country-label').value,
                            countryError: document.getElementById(paymentMethod + '-country-error').value,
                            stateLabel: document.getElementById(paymentMethod + '-state-label').value,
                            stateError: document.getElementById(paymentMethod + '-state-error').value,
                            prefilledName: document.getElementById(paymentMethod + '-prefilled-name').value,
                            prefilledLastName: document.getElementById(paymentMethod + '-prefilled-lastname').value,
                            prefilledEmail: document.getElementById(paymentMethod + '-prefilled-email').value,
                            prefilledAddress: document.getElementById(paymentMethod + '-prefilled-address').value,
                            prefilledZipCode: document.getElementById(paymentMethod + '-prefilled-zipcode').value,
                            prefilledCity: document.getElementById(paymentMethod + '-prefilled-city').value,
                            prefilledCountry: document.getElementById(paymentMethod + '-prefilled-country').value,
                            prefilledState: document.getElementById(paymentMethod + '-prefilled-state').value,
                        },
                        customization: {
                            font: document.getElementById(paymentMethod + '-font').value,
                            textColor: document.getElementById(paymentMethod + '-text-color').value,
                            backgroundColor: document.getElementById(paymentMethod + '-background-color').value,
                            errorColor: document.getElementById(paymentMethod + '-error-color').value,
                            borderColor: document.getElementById(paymentMethod + '-border-color').value,
                            borderRadius: document.getElementById(paymentMethod + '-border-radius').value,
                            padding: document.getElementById(paymentMethod + '-padding').value,
                            inputTextSize: document.getElementById(paymentMethod + '-input-text-size').value,
                            labelTextSize: document.getElementById(paymentMethod + '-label-text-size').value,
                            iconSize: "20px",
                            iconColor: document.getElementById(paymentMethod + '-icon-color').value,
                        }
                    });

                    document.getElementById('payment-iframe').style.height = "310px";

                    window.addEventListener('message', event => {
                        if (event.data.giropay_valid === true) {
                            payButton.classList.remove('disabled');
                        }

                        if (event.data.giropay_valid === false) {
                            payButton.classList.add('disabled');
                        }
                    });

                    payButton.addEventListener("click", () => {
                        window.postMessage({ pay: paymentMethod });
                    });
                } else if (paymentMethod === "ideal") {
                    await paylandsCheckout.ideal({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: document.getElementById(paymentMethod + '-name-label').value,
                            nameError: document.getElementById(paymentMethod + '-name-error').value,
                            lastNameLabel: document.getElementById(paymentMethod + '-lastname-label').value,
                            lastNameError: document.getElementById(paymentMethod + '-lastname-error').value,
                            emailLabel: document.getElementById(paymentMethod + '-email-label').value,
                            emailError: document.getElementById(paymentMethod + '-email-error').value,
                            addressLabel: document.getElementById(paymentMethod + '-address-label').value,
                            addressError: document.getElementById(paymentMethod + '-address-error').value,
                            zipCodeLabel: document.getElementById(paymentMethod + '-zipcode-label').value,
                            zipCodeError: document.getElementById(paymentMethod + '-zipcode-error').value,
                            cityLabel: document.getElementById(paymentMethod + '-city-label').value,
                            cityError: document.getElementById(paymentMethod + '-city-error').value,
                            countryLabel: document.getElementById(paymentMethod + '-country-label').value,
                            countryError: document.getElementById(paymentMethod + '-country-error').value,
                            stateLabel: document.getElementById(paymentMethod + '-state-label').value,
                            stateError: document.getElementById(paymentMethod + '-state-error').value,
                            prefilledName: document.getElementById(paymentMethod + '-prefilled-name').value,
                            prefilledLastName: document.getElementById(paymentMethod + '-prefilled-lastname').value,
                            prefilledEmail: document.getElementById(paymentMethod + '-prefilled-email').value,
                            prefilledAddress: document.getElementById(paymentMethod + '-prefilled-address').value,
                            prefilledZipCode: document.getElementById(paymentMethod + '-prefilled-zipcode').value,
                            prefilledCity: document.getElementById(paymentMethod + '-prefilled-city').value,
                            prefilledCountry: document.getElementById(paymentMethod + '-prefilled-country').value,
                            prefilledState: document.getElementById(paymentMethod + '-prefilled-state').value,
                        },
                        customization: {
                            font: document.getElementById(paymentMethod + '-font').value,
                            textColor: document.getElementById(paymentMethod + '-text-color').value,
                            backgroundColor: document.getElementById(paymentMethod + '-background-color').value,
                            errorColor: document.getElementById(paymentMethod + '-error-color').value,
                            borderColor: document.getElementById(paymentMethod + '-border-color').value,
                            borderRadius: document.getElementById(paymentMethod + '-border-radius').value,
                            padding: document.getElementById(paymentMethod + '-padding').value,
                            inputTextSize: document.getElementById(paymentMethod + '-input-text-size').value,
                            labelTextSize: document.getElementById(paymentMethod + '-label-text-size').value,
                            iconSize: "20px",
                            iconColor: document.getElementById(paymentMethod + '-icon-color').value,
                        }
                    });

                    document.getElementById('payment-iframe').style.height = "310px";

                    window.addEventListener('message', event => {
                        if (event.data.ideal_valid === true) {
                            payButton.classList.remove('disabled');
                        }

                        if (event.data.ideal_valid === false) {
                            payButton.classList.add('disabled');
                        }
                    });

                    payButton.addEventListener("click", () => {
                        window.postMessage({ pay: paymentMethod });
                    });
                } else if (paymentMethod === "viacash") {
                    await paylandsCheckout.viacash({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: document.getElementById(paymentMethod + '-name-label').value,
                            nameError: document.getElementById(paymentMethod + '-name-error').value,
                            lastNameLabel: document.getElementById(paymentMethod + '-lastname-label').value,
                            lastNameError: document.getElementById(paymentMethod + '-lastname-error').value,
                            emailLabel: document.getElementById(paymentMethod + '-email-label').value,
                            emailError: document.getElementById(paymentMethod + '-email-error').value,
                            prefilledName: document.getElementById(paymentMethod + '-prefilled-name').value,
                            prefilledLastName: document.getElementById(paymentMethod + '-prefilled-lastname').value,
                            prefilledEmail: document.getElementById(paymentMethod + '-prefilled-email').value,
                        },
                        customization: {
                            font: document.getElementById(paymentMethod + '-font').value,
                            textColor: document.getElementById(paymentMethod + '-text-color').value,
                            backgroundColor: document.getElementById(paymentMethod + '-background-color').value,
                            errorColor: document.getElementById(paymentMethod + '-error-color').value,
                            borderColor: document.getElementById(paymentMethod + '-border-color').value,
                            borderRadius: document.getElementById(paymentMethod + '-border-radius').value,
                            padding: document.getElementById(paymentMethod + '-padding').value,
                            inputTextSize: document.getElementById(paymentMethod + '-input-text-size').value,
                            labelTextSize: document.getElementById(paymentMethod + '-label-text-size').value,
                            iconSize: "20px",
                            iconColor: document.getElementById(paymentMethod + '-icon-color').value,
                        }
                    });

                    document.getElementById('payment-iframe').style.height = "140px";

                    window.addEventListener('message', event => {
                        if (event.data.viacash_valid === true) {
                            payButton.classList.remove('disabled');
                        }

                        if (event.data.viacash_valid === false) {
                            payButton.classList.add('disabled');
                        }
                    });

                    payButton.addEventListener("click", () => {
                        window.postMessage({ pay: paymentMethod });
                    });
                } else if (paymentMethod === "sofort") {
                    await paylandsCheckout.sofort({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: document.getElementById(paymentMethod + '-name-label').value,
                            nameError: document.getElementById(paymentMethod + '-name-error').value,
                            lastNameLabel: document.getElementById(paymentMethod + '-lastname-label').value,
                            lastNameError: document.getElementById(paymentMethod + '-lastname-error').value,
                            emailLabel: document.getElementById(paymentMethod + '-email-label').value,
                            emailError: document.getElementById(paymentMethod + '-email-error').value,
                            addressLabel: document.getElementById(paymentMethod + '-address-label').value,
                            addressError: document.getElementById(paymentMethod + '-address-error').value,
                            zipCodeLabel: document.getElementById(paymentMethod + '-zipcode-label').value,
                            zipCodeError: document.getElementById(paymentMethod + '-zipcode-error').value,
                            cityLabel: document.getElementById(paymentMethod + '-city-label').value,
                            cityError: document.getElementById(paymentMethod + '-city-error').value,
                            countryLabel: document.getElementById(paymentMethod + '-country-label').value,
                            countryError: document.getElementById(paymentMethod + '-country-error').value,
                            stateLabel: document.getElementById(paymentMethod + '-state-label').value,
                            stateError: document.getElementById(paymentMethod + '-state-error').value,
                            prefilledName: document.getElementById(paymentMethod + '-prefilled-name').value,
                            prefilledLastName: document.getElementById(paymentMethod + '-prefilled-lastname').value,
                            prefilledEmail: document.getElementById(paymentMethod + '-prefilled-email').value,
                            prefilledAddress: document.getElementById(paymentMethod + '-prefilled-address').value,
                            prefilledZipCode: document.getElementById(paymentMethod + '-prefilled-zipcode').value,
                            prefilledCity: document.getElementById(paymentMethod + '-prefilled-city').value,
                            prefilledCountry: document.getElementById(paymentMethod + '-prefilled-country').value,
                            prefilledState: document.getElementById(paymentMethod + '-prefilled-state').value,
                        },
                        customization: {
                            font: document.getElementById(paymentMethod + '-font').value,
                            textColor: document.getElementById(paymentMethod + '-text-color').value,
                            backgroundColor: document.getElementById(paymentMethod + '-background-color').value,
                            errorColor: document.getElementById(paymentMethod + '-error-color').value,
                            borderColor: document.getElementById(paymentMethod + '-border-color').value,
                            borderRadius: document.getElementById(paymentMethod + '-border-radius').value,
                            padding: document.getElementById(paymentMethod + '-padding').value,
                            inputTextSize: document.getElementById(paymentMethod + '-input-text-size').value,
                            labelTextSize: document.getElementById(paymentMethod + '-label-text-size').value,
                            iconSize: "20px",
                            iconColor: document.getElementById(paymentMethod + '-icon-color').value,
                        }
                    });

                    document.getElementById('payment-iframe').style.height = "310px";

                    window.addEventListener('message', event => {
                        if (event.data.sofort_valid === true) {
                            payButton.classList.remove('disabled');
                        }

                        if (event.data.sofort_valid === false) {
                            payButton.classList.add('disabled');
                        }
                    });

                    payButton.addEventListener("click", () => {
                        window.postMessage({ pay: paymentMethod });
                    });
                } else if (paymentMethod === "klarna") {
                    await paylandsCheckout.klarna({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: document.getElementById(paymentMethod + '-name-label').value,
                            nameError: document.getElementById(paymentMethod + '-name-error').value,
                            lastNameLabel: document.getElementById(paymentMethod + '-lastname-label').value,
                            lastNameError: document.getElementById(paymentMethod + '-lastname-error').value,
                            emailLabel: document.getElementById(paymentMethod + '-email-label').value,
                            emailError: document.getElementById(paymentMethod + '-email-error').value,
                            addressLabel: document.getElementById(paymentMethod + '-address-label').value,
                            addressError: document.getElementById(paymentMethod + '-address-error').value,
                            zipCodeLabel: document.getElementById(paymentMethod + '-zipcode-label').value,
                            zipCodeError: document.getElementById(paymentMethod + '-zipcode-error').value,
                            cityLabel: document.getElementById(paymentMethod + '-city-label').value,
                            cityError: document.getElementById(paymentMethod + '-city-error').value,
                            countryLabel: document.getElementById(paymentMethod + '-country-label').value,
                            countryError: document.getElementById(paymentMethod + '-country-error').value,
                            stateLabel: document.getElementById(paymentMethod + '-state-label').value,
                            stateError: document.getElementById(paymentMethod + '-state-error').value,
                            prefilledName: document.getElementById(paymentMethod + '-prefilled-name').value,
                            prefilledLastName: document.getElementById(paymentMethod + '-prefilled-lastname').value,
                            prefilledEmail: document.getElementById(paymentMethod + '-prefilled-email').value,
                            prefilledAddress: document.getElementById(paymentMethod + '-prefilled-address').value,
                            prefilledZipCode: document.getElementById(paymentMethod + '-prefilled-zipcode').value,
                            prefilledCity: document.getElementById(paymentMethod + '-prefilled-city').value,
                            prefilledCountry: document.getElementById(paymentMethod + '-prefilled-country').value,
                            prefilledState: document.getElementById(paymentMethod + '-prefilled-state').value,
                        },
                        customization: {
                            font: document.getElementById(paymentMethod + '-font').value,
                            textColor: document.getElementById(paymentMethod + '-text-color').value,
                            backgroundColor: document.getElementById(paymentMethod + '-background-color').value,
                            errorColor: document.getElementById(paymentMethod + '-error-color').value,
                            borderColor: document.getElementById(paymentMethod + '-border-color').value,
                            borderRadius: document.getElementById(paymentMethod + '-border-radius').value,
                            padding: document.getElementById(paymentMethod + '-padding').value,
                            inputTextSize: document.getElementById(paymentMethod + '-input-text-size').value,
                            labelTextSize: document.getElementById(paymentMethod + '-label-text-size').value,
                            iconSize: "20px",
                            iconColor: document.getElementById(paymentMethod + '-icon-color').value,
                        }
                    });

                    document.getElementById('payment-iframe').style.height = "310px";

                    window.addEventListener('message', event => {
                        if (event.data.klarna_valid === true) {
                            payButton.classList.remove('disabled');
                        }

                        if (event.data.klarna_valid === false) {
                            payButton.classList.add('disabled');
                        }
                    });

                    payButton.addEventListener("click", () => {
                        window.postMessage({ pay: paymentMethod });
                    });

                } else if (paymentMethod === "transfer") {
                    await paylandsCheckout.transfer({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: document.getElementById(paymentMethod + '-name-label').value,
                            nameError: document.getElementById(paymentMethod + '-name-error').value,
                            lastNameLabel: document.getElementById(paymentMethod + '-lastname-label').value,
                            lastNameError: document.getElementById(paymentMethod + '-lastname-error').value,
                            emailLabel: document.getElementById(paymentMethod + '-email-label').value,
                            emailError: document.getElementById(paymentMethod + '-email-error').value,
                            prefilledName: document.getElementById(paymentMethod + '-prefilled-name').value,
                            prefilledLastName: document.getElementById(paymentMethod + '-prefilled-lastname').value,
                            prefilledEmail: document.getElementById(paymentMethod + '-prefilled-email').value,
                        },
                        customization: {
                            font: document.getElementById(paymentMethod + '-font').value,
                            textColor: document.getElementById(paymentMethod + '-text-color').value,
                            backgroundColor: document.getElementById(paymentMethod + '-background-color').value,
                            errorColor: document.getElementById(paymentMethod + '-error-color').value,
                            borderColor: document.getElementById(paymentMethod + '-border-color').value,
                            borderRadius: document.getElementById(paymentMethod + '-border-radius').value,
                            padding: document.getElementById(paymentMethod + '-padding').value,
                            inputTextSize: document.getElementById(paymentMethod + '-input-text-size').value,
                            labelTextSize: document.getElementById(paymentMethod + '-label-text-size').value,
                            iconSize: "20px",
                            iconColor: document.getElementById(paymentMethod + '-icon-color').value,
                        }
                    });

                    document.getElementById('payment-iframe').style.height = "140px";

                    window.addEventListener('message', event => {
                        if (event.data.transfer_valid === true) {
                            payButton.classList.remove('disabled');
                        }

                        if (event.data.transfer_valid === false) {
                            payButton.classList.add('disabled');
                        }
                    });

                    payButton.addEventListener("click", () => {
                        window.postMessage({ pay: paymentMethod });
                    });
                    
                } else if (paymentMethod === "multibanco") {
                    payButton.style.display = "none";

                    await paylandsCheckout.multibanco({
                        container: 'payment-iframe',
                        customization: {
                            buttonText: document.getElementById(paymentMethod + '-button-text').value,
                            font: document.getElementById(paymentMethod + '-font').value,
                            primaryColor: document.getElementById(paymentMethod + '-primary-color').value,
                            textColor: document.getElementById(paymentMethod + '-text-color').value,
                            backgroundColor: document.getElementById(paymentMethod + '-background-color').value,
                            borderRadius: document.getElementById(paymentMethod + '-border-radius').value,
                            padding: document.getElementById(paymentMethod + '-padding').value,
                            buttonTextSize: document.getElementById(paymentMethod + '-button-text-size').value,
                        }
                    });

                } else if (paymentMethod === "mbway") {
                    await paylandsCheckout.mbway({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: document.getElementById(paymentMethod + '-name-label').value,
                            nameError: document.getElementById(paymentMethod + '-name-error').value,
                            lastNameLabel: document.getElementById(paymentMethod + '-lastname-label').value,
                            lastNameError: document.getElementById(paymentMethod + '-lastname-error').value,
                            emailLabel: document.getElementById(paymentMethod + '-email-label').value,
                            emailError: document.getElementById(paymentMethod + '-email-error').value,
                            prefixLabel: document.getElementById(paymentMethod + '-prefix-label').value,
                            prefixError: document.getElementById(paymentMethod + '-prefix-error').value,
                            phoneLabel: document.getElementById(paymentMethod + '-phone-label').value,
                            phoneError: document.getElementById(paymentMethod + '-phone-error').value,
                            prefilledName: document.getElementById(paymentMethod + '-prefilled-name').value,
                            prefilledLastName: document.getElementById(paymentMethod + '-prefilled-lastname').value,
                            prefilledEmail: document.getElementById(paymentMethod + '-prefilled-email').value,
                            prefilledPrefix: document.getElementById(paymentMethod + '-prefilled-prefix').value,
                            prefilledPhone: document.getElementById(paymentMethod + '-prefilled-phone').value,
                        },
                        customization: {
                            font: document.getElementById(paymentMethod + '-font').value,
                            textColor: document.getElementById(paymentMethod + '-text-color').value,
                            backgroundColor: document.getElementById(paymentMethod + '-background-color').value,
                            errorColor: document.getElementById(paymentMethod + '-error-color').value,
                            borderColor: document.getElementById(paymentMethod + '-border-color').value,
                            borderRadius: document.getElementById(paymentMethod + '-border-radius').value,
                            padding: document.getElementById(paymentMethod + '-padding').value,
                            inputTextSize: document.getElementById(paymentMethod + '-input-text-size').value,
                            labelTextSize: document.getElementById(paymentMethod + '-label-text-size').value,
                            iconSize: "20px",
                            iconColor: document.getElementById(paymentMethod + '-icon-color').value,
                        }
                    });

                    document.getElementById('payment-iframe').style.height = "190px";

                    window.addEventListener('message', event => {
                        if (event.data.mbway_valid === true) {
                            payButton.classList.remove('disabled');
                        }

                        if (event.data.mbway_valid === false) {
                            payButton.classList.add('disabled');
                        }
                    });

                    payButton.addEventListener("click", () => {
                        window.postMessage({ pay: paymentMethod });
                    });

                } else if (paymentMethod === "floa") {
                    payButton.style.display = "none";

                    await paylandsCheckout.floa({
                        container: 'payment-iframe',
                        customization: {
                            buttonText: document.getElementById(paymentMethod + '-button-text').value,
                            font: document.getElementById(paymentMethod + '-font').value,
                            primaryColor: document.getElementById(paymentMethod + '-primary-color').value,
                            textColor: document.getElementById(paymentMethod + '-text-color').value,
                            backgroundColor: document.getElementById(paymentMethod + '-background-color').value,
                            borderRadius: document.getElementById(paymentMethod + '-border-radius').value,
                            padding: document.getElementById(paymentMethod + '-padding').value,
                            buttonTextSize: document.getElementById(paymentMethod + '-button-text-size').value,
                        }
                    });
                                        
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

        window.addEventListener('message', event => {
            if (event.data.redirect) {
                window.top.location.href = event.data.redirect;
            } else if (event.data.render) {
                document.getElementById('payment-iframe').innerHTML = event.data.render;
                document.getElementById('payment-iframe').style.height = "100%";
                // document.querySelector('form').submit();
            } else if (event.data.error) {
                document.getElementById('payment-iframe').innerHTML = event.data.error;
                document.getElementById('payment-iframe').style.height = "100%";
            }
        });
    });

    function renderCartItems() {
        cartItemsList.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} - ${item.price}€`;
            cartItemsList.appendChild(li);
            total += item.price;
        });

        totalAmount.innerText = total;
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };