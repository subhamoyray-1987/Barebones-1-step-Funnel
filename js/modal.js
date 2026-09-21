
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('unifyErrorModal');
  const closeBtn = document.querySelector('.unify-modal-close');
  const triggers = document.querySelectorAll('[data-modal-target="#unifyErrorModal"], #btn-submit-order');

  // Open modal function
  window.openModal = () => {
    if (modal) {
      modal.classList.add('is-open');
      document.body.classList.add('unify-modal-open');
    }
  };

  window.closeModal = () => {
    if (modal) {
      modal.classList.remove('is-open');
      document.body.classList.remove('unify-modal-open');
    }
  };

  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.openModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.closeModal();
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        window.closeModal();
      }
    });
  }

  setTimeout(window.openModal, 100);
});
