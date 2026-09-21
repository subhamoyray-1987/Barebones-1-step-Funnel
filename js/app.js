/**
 * Unify CMS V6 - Unified Client Interactions & Checkout Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for anchor links across site
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Dynamic Year in footer
  const copyrightEls = document.querySelectorAll('.footer-legal-text, .footer-subtext-unify');
  copyrightEls.forEach(el => {
    if (el && el.textContent.includes('2026')) {
      const currentYear = new Date().getFullYear();
      el.innerHTML = el.innerHTML.replace('2026', currentYear);
    }
  });

  // --- CHECKOUT CALCULATION ENGINE ---
  const isCheckoutPage = document.body.classList.contains('checkout-page') || document.querySelector('.checkout-grid');
  if (!isCheckoutPage) return;

  const state = {
    basePrice: 129.99,
    discountRate: 0.20, // 20% discount (SAVE20)
    shippingPrice: 0.00,
    protectionPrice: 0.00,
    crossSells: new Map() // id -> { name, price }
  };

  const subtotalEl = document.getElementById('summary-subtotal');
  const discountEl = document.getElementById('summary-discount');
  const shippingEl = document.getElementById('summary-shipping');
  const grandTotalEl = document.getElementById('summary-grand-total');
  const protectionLine = document.getElementById('protection-line');
  const crossSellsSummaryContainer = document.getElementById('summary-cross-sells-list');

  const shippingRadios = document.querySelectorAll('input[name="shipping_method"]');
  const shippingCards = document.querySelectorAll('.shipping-method-card');
  const protectionCheckbox = document.getElementById('shipping-protection');
  const billingSameCheckbox = document.getElementById('billing-same-as-shipping');
  const billingFields = document.getElementById('billing-address-fields');
  const crossSellButtons = document.querySelectorAll('.btn-cross-sell-add');

  const couponInput = document.getElementById('coupon-code');
  const couponBtn = document.getElementById('btn-apply-coupon');
  const couponError = document.getElementById('coupon-error');

  function recalculate() {
    let crossSellTotal = 0;
    state.crossSells.forEach(item => {
      crossSellTotal += item.price;
    });

    const currentSubtotal = state.basePrice + crossSellTotal;
    const currentDiscount = currentSubtotal * state.discountRate;
    const currentTotal = (currentSubtotal - currentDiscount) + state.shippingPrice + state.protectionPrice;

    if (subtotalEl) {
      subtotalEl.textContent = `$${currentSubtotal.toFixed(2)}`;
    }
    if (discountEl) {
      discountEl.textContent = `-$${currentDiscount.toFixed(2)}`;
    }
    if (shippingEl) {
      if (state.shippingPrice === 0) {
        shippingEl.textContent = 'FREE';
        shippingEl.className = 'line-value shipping-free-badge';
      } else {
        shippingEl.textContent = `$${state.shippingPrice.toFixed(2)}`;
        shippingEl.className = 'line-value fw-bold';
      }
    }
    if (grandTotalEl) {
      grandTotalEl.textContent = `$${currentTotal.toFixed(2)}`;
    }

    if (crossSellsSummaryContainer) {
      crossSellsSummaryContainer.innerHTML = '';
      state.crossSells.forEach((item) => {
        const itemRow = document.createElement('div');
        itemRow.className = 'summary-product-item summary-cross-sell-item mt-2';
        itemRow.innerHTML = `
          <div class="summary-product-thumb" style="width: 36px; height: 36px; border-radius: 3px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" stroke-width="1.5" style="width: 100%; height: 100%;">
              <rect x="3" y="3" width="18" height="18" rx="2" fill="#e4e4e7" stroke="none"></rect>
              <circle cx="8.5" cy="8.5" r="1.5" fill="#a1a1aa"></circle>
              <path d="M21 15l-5-5L5 21" stroke="#a1a1aa" stroke-width="1.5"></path>
            </svg>
          </div>
          <div class="summary-product-details">
            <div class="product-item-name" style="font-size: 13px;">${item.name}</div>
            <div class="product-item-price" style="font-size: 13px;">$${item.price.toFixed(2)}</div>
          </div>
        `;
        crossSellsSummaryContainer.appendChild(itemRow);
      });
    }
  }

  // Shipping Method Selection
  shippingRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const selectedVal = parseFloat(e.target.value) || 0.00;
      state.shippingPrice = selectedVal;

      shippingCards.forEach(card => card.classList.remove('active'));
      const parentCard = e.target.closest('.shipping-method-card');
      if (parentCard) {
        parentCard.classList.add('active');
      }

      recalculate();
    });
  });

  shippingCards.forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.tagName !== 'INPUT') {
        const radio = this.querySelector('input[type="radio"]');
        if (radio && !radio.checked) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change'));
        }
      }
    });
  });

  // Shipping Protection Checkbox
  if (protectionCheckbox) {
    protectionCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        state.protectionPrice = 9.95;
        if (protectionLine) protectionLine.style.display = 'flex';
      } else {
        state.protectionPrice = 0.00;
        if (protectionLine) protectionLine.style.display = 'none';
      }
      recalculate();
    });
  }

  // Billing Address Toggle
  if (billingSameCheckbox && billingFields) {
    billingSameCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        billingFields.style.display = 'none';
      } else {
        billingFields.style.display = 'block';
      }
    });
  }

  // Cross-sell Add / Remove
  crossSellButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.cross-sell-card');
      const id = this.getAttribute('data-id');
      const name = card.getAttribute('data-name');
      const price = parseFloat(card.getAttribute('data-price')) || 12.99;

      if (state.crossSells.has(id)) {
        state.crossSells.delete(id);
        this.classList.remove('added');
        this.textContent = 'ADD';
      } else {
        state.crossSells.set(id, { name, price });
        this.classList.add('added');
        this.textContent = 'Remove';
      }

      recalculate();
    });
  });

  // Coupon Code Validation
  if (couponBtn && couponInput) {
    couponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      if (!code || code === 'SAVE20') {
        if (code === 'SAVE20') {
          couponInput.classList.remove('is-invalid');
          if (couponError) {
            couponError.textContent = "Promo 'SAVE20' is already applied to your order.";
            couponError.style.color = 'var(--color-success)';
            couponError.style.display = 'block';
          }
        } else {
          couponInput.classList.add('is-invalid');
          if (couponError) {
            couponError.textContent = 'Enter a valid coupon or gift card';
            couponError.style.color = 'var(--color-error)';
            couponError.style.display = 'block';
          }
        }
      } else {
        couponInput.classList.add('is-invalid');
        if (couponError) {
          couponError.textContent = `'${code}' is not a valid discount code`;
          couponError.style.color = 'var(--color-error)';
          couponError.style.display = 'block';
        }
      }
    });
  }

  // Card formatting
  const cardNumberInput = document.getElementById('card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
      e.target.value = formatted;
    });
  }

  const cardExpiryInput = document.getElementById('card-expiry');
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 2) {
        e.target.value = val.substring(0, 2) + ' / ' + val.substring(2);
      } else {
        e.target.value = val;
      }
    });
  }

  const phoneInput = document.getElementById('contact-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
  }

  // Initial calculation
  recalculate();
});
