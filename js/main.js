/**
 * Reformas Martínez - Lógica de Interacción
 * Menú responsive, acordeón FAQ, scroll suave y gestión del formulario
 */

// Inicialización del cliente Supabase
const SUPABASE_URL = 'https://imqjnzhbdljnvkhzqfds.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5PP0R0ZE4qA65g-YargytA_vTqePjfZ';
const supabaseClient = (window.supabase && typeof window.supabase.createClient === 'function')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. Menú Móvil
  // -------------------------------------------------------------------------
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('open');
    });

    // Cerrar menú al hacer clic en cualquier enlace
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // -------------------------------------------------------------------------
  // 2. Acordeón de Preguntas Frecuentes (FAQ)
  // -------------------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');

    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Cerrar otros elementos abiertos para mayor claridad
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherBtn = otherItem.querySelector('.faq-question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Alternar el elemento actual
        item.classList.toggle('active', !isActive);
        questionBtn.setAttribute('aria-expanded', !isActive);
      });
    }
  });

  // -------------------------------------------------------------------------
  // 3. Sombra dinámica en la cabecera al hacer scroll
  // -------------------------------------------------------------------------
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader.style.boxShadow = '0 4px 20px rgba(13, 27, 42, 0.08)';
    } else {
      siteHeader.style.boxShadow = 'none';
    }
  });

  // -------------------------------------------------------------------------
  // 4. Gestión y Validación del Formulario de Presupuesto
  // -------------------------------------------------------------------------
  const budgetForm = document.getElementById('budgetForm');
  const formFeedback = document.getElementById('formFeedback');

  if (budgetForm && formFeedback) {
    budgetForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Extracción de datos
      const nombre = document.getElementById('nombre').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const email = document.getElementById('email').value.trim();
      const servicio = document.getElementById('servicio').value;
      const privacidad = document.getElementById('privacidad').checked;
      const submitBtn = budgetForm.querySelector('button[type="submit"]');

      // Validaciones básicas
      if (!nombre || !telefono || !servicio) {
        showFeedback('Por favor, completa todos los campos requeridos (*).', 'error');
        return;
      }

      // Validación simple de teléfono (mínimo 9 dígitos)
      const phoneRegex = /^[0-9+() -]{9,15}$/;
      if (!phoneRegex.test(telefono)) {
        showFeedback('Por favor, introduce un número de teléfono válido (mínimo 9 dígitos).', 'error');
        return;
      }

      if (!privacidad) {
        showFeedback('Debes aceptar la política de privacidad para continuar.', 'error');
        return;
      }

      // Envío real a Supabase
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation: spin 1s linear infinite; width:18px; height:18px; margin-right:8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg>
        Guardando solicitud...
      `;

      (async () => {
        try {
          if (!supabaseClient) {
            throw new Error('El cliente de Supabase no se cargó correctamente.');
          }

          const { error } = await supabaseClient
            .from('solicitudes_presupuesto')
            .insert([
              {
                nombre: nombre,
                telefono: telefono,
                email: email || null,
                servicio: servicio
              }
            ]);

          if (error) {
            throw error;
          }

          showFeedback(
            `¡Muchas gracias, ${nombre}! Hemos recibido tu solicitud para ${servicio.toLowerCase()} correctamente. Nos pondremos en contacto contigo en breve.`,
            'success'
          );
          budgetForm.reset();
        } catch (err) {
          console.error('Error al guardar en Supabase:', err);
          showFeedback('Hubo un error al registrar tu solicitud. Por favor, inténtalo de nuevo o llámanos directamente.', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      })();
    });
  }

  function showFeedback(message, type) {
    if (!formFeedback) return;
    formFeedback.textContent = message;
    formFeedback.className = `form-feedback ${type}`;
    formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
