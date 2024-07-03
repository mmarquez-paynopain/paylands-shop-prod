document.addEventListener('DOMContentLoaded', () => {
    const checkoutSection = document.getElementById('checkout');
    const totalAmount = document.getElementById('total-amount');
    const payButton = document.getElementById('pay-button');

    let cart = {};
    let total = 0;

    window.addEventListener('message', event => {
        if (event.data.redirect) {
            window.top.location.href = event.data.redirect;
        } else if (event.data.render) {
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.frameBorder = '0';
            iframe.srcdoc = event.data.render;

            document.getElementById('payment-iframe').innerHTML = '';
            document.getElementById('payment-iframe').style.height = "100%";
            document.getElementById('payment-iframe').style.maxWidth = "100%";
            document.getElementById('payment-iframe').appendChild(iframe);
            document.getElementById('cart-button').style.display = 'none';
            if (document.getElementById('pay-button')) {
                document.getElementById('pay-button').style.display = 'none';
            }
        } else if (event.data.error) {
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.frameBorder = '0';
            iframe.srcdoc = event.data.error;

            document.getElementById('payment-iframe').innerHTML = '';
            document.getElementById('payment-iframe').style.height = "100%";
            document.getElementById('payment-iframe').style.maxWidth = "100%";
            document.getElementById('payment-iframe').appendChild(iframe);
            document.getElementById('cart-button').style.display = 'none';
            if (document.getElementById('pay-button')) {
                document.getElementById('pay-button').style.display = 'none';
            }
        }
    });
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            total += parseFloat(button.dataset.price);
            cart[button.dataset.name] = '€' + parseFloat(button.dataset.price);
            document.getElementById('cart-count').innerText = Object.keys(cart).length;

            showToast();
        });
    });

    document.getElementById('cart-button').addEventListener('click', async () => {
        const config = await loadConfig();

        if (0 !== total) {
            fetch('/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "signature": config.signature,
                    "amount": parseFloat(total) * 100,
                    "operative": "AUTHORIZATION",
                    "secure": true,
                    "description": "Checkout SDK Test",
                    "service": config.service,
                    "extra_data": {
                        "checkout": {
                            "uuid": config.checkout,
                            "customization": {
                                "payment_details": cart
                            }
                        }
                    }
                })
            })
            .then(response => response.json())
            .then(async data => {
                const paylandsCheckout = await PaylandsCheckout.create({
                    token: data.order.token,
                    environment: 'SANDBOX',
                    mode: 'DEV'
                });
                
                document.querySelector('main').style.display = 'none';
                checkoutSection.classList.remove('hidden');
                totalAmount.innerText = total;
                document.getElementById('payment-iframe').innerHTML = "";
                document.getElementById('payment-iframe').style.height = "100%";
                document.getElementById('payment-iframe').style.maxWidth = "100%";
                document.getElementById('pay-button').style.display = 'none';

                await paylandsCheckout.render('payment-iframe');
            });
        }
    });

    document.querySelectorAll('.pay-now').forEach(button => {
        button.addEventListener('click', async () => {
            const config = await loadConfig();

            await fetch('/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "signature": config.signature,
                    "amount": parseFloat(button.dataset.price) * 100,
                    "operative": "AUTHORIZATION",
                    "secure": true,
                    "description": "Checkout SDK Test",
                    "service": config.service,
                    "extra_data": {
                        "checkout": {
                            "uuid": config.checkout
                        }
                    }
                })
            })
            .then(response => response.json())
            .then(async data => {
                const paylandsCheckout = await PaylandsCheckout.create({
                    token: data.order.token,
                    environment: 'SANDBOX',
                    mode: 'DEV'
                });

                const productId = parseInt(button.dataset.id);
                document.querySelector('main').style.display = 'none';
                checkoutSection.classList.remove('hidden');
                totalAmount.innerText = button.dataset.price;
                document.getElementById('payment-iframe').innerHTML = "";

                await paylandsCheckout.google_pay("payment-iframe");
                await paylandsCheckout.apple_pay("payment-iframe");
                await paylandsCheckout.payPal({container: 'payment-iframe', form: {}, customization: {}});
                await paylandsCheckout.multibanco({container: 'payment-iframe', customization: {buttonText: "Pagar ya con Multibanco", primaryColor: "#3A75C4", backgroundColor: "#F1F1F1"}});
                await paylandsCheckout.floa({container: 'payment-iframe', customization: {buttonText: "Pagar ya con FLOA", primaryColor: "#009FFF", backgroundColor: "#F1F1F1"}});

                document.getElementById('paylands-checkout-paypal').style.height = '114px';
                document.getElementById('paylands-checkout-multibanco').style.height = '60px';
                document.getElementById('paylands-checkout-floa').style.height = '60px';

                let paymentMethod = 'card';

                if (1 === productId) {
                    await paylandsCheckout.card({
                        container: "payment-iframe",
                        form: {
                            holderLabel: "Nombre y apellidos",
                            holderError: "El nombre introducido no es correcto",
                            panLabel: "Número de tarjeta",
                            panError: "El número de tarjeta no es correcto",
                            expiryLabel: "Fecha de caducidad",
                            expiryError: "La fecha es incorrecta o está caducada",
                            cvvLabel: "Código de seguridad (CVV)",
                            cvvError: "El código no es correcto",
                        },
                        customization: {
                            backgroundColor: "#F1F1F1"
                        }
                    });
                    document.getElementById('paylands-checkout-' + paymentMethod).style.height = '150px';
                }

                if (2 === productId) {
                    await paylandsCheckout.bizum({
                        container: 'payment-iframe',
                        form: {
                            prefixLabel: "Prefijo",
                            prefixError: "El prefijo no es válido",
                            phoneLabel: "Número de teléfono",
                            phoneError: "EL número de teléfono no es válido",
                        },
                        customization: {
                            borderColor: "#04b9c6",
                            iconColor: "#04b9c6",
                            backgroundColor: "#F1F1F1"
                        }
                    });
                    paymentMethod = 'bizum';
                    document.getElementById('paylands-checkout-' + paymentMethod).style.height = '70px';
                }

                if (3 === productId) {
                    await paylandsCheckout.cofidis({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: "Nombre",
                            nameError: "El nombre no es válido",
                            lastNameLabel: "Apellidos",
                            lastNameError: "Los apellidos no son válidos",
                            emailLabel: "Correo electrónico",
                            emailError: "El correo electrónico no es válido",
                        },
                        customization: {
                            borderColor: "#EFBF4E",
                            iconColor: "#EFBF4E",
                            backgroundColor: "#F1F1F1"
                        }
                    });
                    paymentMethod = 'cofidis';
                    document.getElementById('paylands-checkout-' + paymentMethod).style.height = '130px';
                }

                if (4 === productId) {
                    await paylandsCheckout.giropay({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: "Nombre",
                            nameError: "El nombre no es válido",
                            lastNameLabel: "Apellidos",
                            lastNameError: "Los apellidos no son válidos",
                            emailLabel: "Correo electrónico",
                            emailError: "El correo electrónico no es válido",
                            addressLabel: "Dirección",
                            addressError: "La dirección no es correcta",
                            zipCodeLabel: "Código postal",
                            zipCodeError: "El código postal no es correcto",
                            cityLabel: "Ciudad",
                            cityError: "La ciudad no es correcta",
                            countryLabel: "País",
                            countryError: "El país no es correcto",
                            stateLabel: "Estado",
                            stateError: "El estado no es correcto",
                        },
                        customization: {
                            borderColor: "#1F3A6A",
                            iconColor: "#1F3A6A",
                            backgroundColor: "#F1F1F1"
                        }
                    });
                    paymentMethod = 'giropay';
                    document.getElementById('paylands-checkout-' + paymentMethod).style.height = '280px';
                }

                if (5 === productId) {
                    await paylandsCheckout.ideal({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: "Nombre",
                            nameError: "El nombre no es válido",
                            lastNameLabel: "Apellidos",
                            lastNameError: "Los apellidos no son válidos",
                            emailLabel: "Correo electrónico",
                            emailError: "El correo electrónico no es válido",
                            addressLabel: "Dirección",
                            addressError: "La dirección no es correcta",
                            zipCodeLabel: "Código postal",
                            zipCodeError: "El código postal no es correcto",
                            cityLabel: "Ciudad",
                            cityError: "La ciudad no es correcta",
                            countryLabel: "País",
                            countryError: "El país no es correcto",
                            stateLabel: "Estado",
                            stateError: "El estado no es correcto",
                        },
                        customization: {
                            borderColor: "#CC0066",
                            iconColor: "#CC0066",
                            backgroundColor: "#F1F1F1"
                        }
                    });
                    paymentMethod = 'ideal';
                    document.getElementById('paylands-checkout-' + paymentMethod).style.height = '280px';
                }

                if (6 === productId) {
                    await paylandsCheckout.viacash({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: "Nombre",
                            nameError: "El nombre no es válido",
                            lastNameLabel: "Apellidos",
                            lastNameError: "Los apellidos no son válidos",
                            emailLabel: "Correo electrónico",
                            emailError: "El correo electrónico no es válido",
                        },
                        customization: {
                            borderColor: "#52FFD0",
                            iconColor: "#52FFD0",
                            backgroundColor: "#F1F1F1"
                        }
                    });
                    paymentMethod = 'viacash';
                    document.getElementById('paylands-checkout-' + paymentMethod).style.height = '130px';
                }

                if (7 === productId) {
                    await paylandsCheckout.klarna({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: "Nombre",
                            nameError: "El nombre no es válido",
                            lastNameLabel: "Apellidos",
                            lastNameError: "Los apellidos no son válidos",
                            emailLabel: "Correo electrónico",
                            emailError: "El correo electrónico no es válido",
                            addressLabel: "Dirección",
                            addressError: "La dirección no es correcta",
                            zipCodeLabel: "Código postal",
                            zipCodeError: "El código postal no es correcto",
                            cityLabel: "Ciudad",
                            cityError: "La ciudad no es correcta",
                            countryLabel: "País",
                            countryError: "El país no es correcto",
                            stateLabel: "Estado",
                            stateError: "El estado no es correcto",
                        },
                        customization: {
                            borderColor: "#FFA8CD",
                            iconColor: "#FFA8CD",
                            backgroundColor: "#F1F1F1"
                        }
                    });
                    paymentMethod = 'klarna';
                    document.getElementById('paylands-checkout-' + paymentMethod).style.height = '280px';
                }

                if (8 === productId) {
                    await paylandsCheckout.transfer({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: "Nombre",
                            nameError: "El nombre no es válido",
                            lastNameLabel: "Apellidos",
                            lastNameError: "Los apellidos no son válidos",
                            emailLabel: "Correo electrónico",
                            emailError: "El correo electrónico no es válido",
                        },
                        customization: {
                            borderColor: "#333",
                            iconColor: "#333",
                            backgroundColor: "#F1F1F1"
                        }
                    });
                    paymentMethod = 'transfer';
                    document.getElementById('paylands-checkout-' + paymentMethod).style.height = '130px';
                }

                if (9 === productId) {
                    await paylandsCheckout.mbway({
                        container: 'payment-iframe',
                        form: {
                            nameLabel: "Nombre",
                            nameError: "El nombre no es válido",
                            lastNameLabel: "Apellidos",
                            lastNameError: "Los apellidos no son válidos",
                            emailLabel: "Correo electrónico",
                            emailError: "El correo electrónico no es válido",
                            prefixLabel: "Prefijo",
                            prefixError: "El prefijo no es válido",
                            phoneLabel: "Número de teléfono",
                            phoneError: "EL número de teléfono no es válido",
                        },
                        customization: {
                            borderColor: "#D60510",
                            iconColor: "#D60510",
                            backgroundColor: "#F1F1F1"
                        }
                    });
                    paymentMethod = 'mbway';
                    document.getElementById('paylands-checkout-' + paymentMethod).style.height = '180px';
                }

                window.addEventListener('message', event => {
                    if (event.data[paymentMethod + '_valid'] === 1 || event.data[paymentMethod + '_valid'] === true) 
                        payButton.classList.remove('disabled');

                    if (event.data[paymentMethod + '_valid'] === 0 || event.data[paymentMethod + '_valid'] === false) 
                        payButton.classList.add('disabled');
                });
    
                payButton.addEventListener("click", () => window.postMessage({ pay: paymentMethod }));
            });
        });
    });
});

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

async function loadConfig() {
    const response = await fetch('/env');
    const config = await response.json();
    return config;
}