// ============================================
// CONFIGURACIÓN DE FIREBASE
// ============================================
// IMPORTANTE: Debe ser LA MISMA configuración que en admin.js
const firebaseConfig = {
  apiKey: "AIzaSyD6JBDB2qZMDHF7J1M3Ow7Ma9AF3WXNGiE",
  authDomain: "xv-anos-karol.firebaseapp.com",
  databaseURL: "https://xv-anos-karol-default-rtdb.firebaseio.com",
  projectId: "xv-anos-karol",
  storageBucket: "xv-anos-karol.firebasestorage.app",
  messagingSenderId: "853844382172",
  appId: "1:853844382172:web:a86e9d4cfbc0cecc8f7f19",
  measurementId: "G-VGWB2T9R7W"
};

// Verificar que Firebase esté cargado
if (typeof firebase === 'undefined') {
    console.error('❌ Firebase no está cargado');
} else {
    console.log('✅ Firebase disponible');
}

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado en index.html');
} catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
}

const database = firebase.database();

// ============================================
// COUNTDOWN TIMER
// ============================================
const eventDate = new Date('2025-12-27T15:00:00').getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (daysEl) daysEl.textContent = days;
    if (hoursEl) hoursEl.textContent = hours;
    if (minutesEl) minutesEl.textContent = minutes;
    if (secondsEl) secondsEl.textContent = seconds;

    if (distance < 0) {
        const countdownEl = document.getElementById('countdown');
        if (countdownEl) {
            countdownEl.innerHTML = '<p style="font-size: 2rem;">¡El evento ha comenzado!</p>';
        }
    }
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ============================================
// FUNCIONES DE INVITACIÓN
// ============================================
let currentGuestId = null;

// Decodificar invitación
function decodeInvitation(code) {
    try {
        const decoded = decodeURIComponent(atob(code));
        const parts = decoded.split('|');
        return { 
            name: parts[0], 
            passes: parseInt(parts[1]) 
        };
    } catch (e) {
        console.error('Error al decodificar:', e);
        return null;
    }
}

// Obtener código de la URL
function getInvitationCode() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || params.get('codigo');
    console.log('📋 Código de URL:', code);
    return code;
}

// Buscar invitado en Firebase por código
function findGuestByCode(invitationCode) {
    console.log('🔍 Buscando invitado con código:', invitationCode);
    
    return database.ref('guests').once('value').then(function(snapshot) {
        const guests = snapshot.val();
        console.log('📊 Invitados en Firebase:', guests);
        
        if (!guests) {
            console.log('❌ No hay invitados en la base de datos');
            return null;
        }
        
        for (let guestId in guests) {
            if (guests[guestId].invitationCode === invitationCode) {
                console.log('✅ Invitado encontrado:', guests[guestId]);
                return { 
                    id: guestId, 
                    ...guests[guestId] 
                };
            }
        }
        
        console.log('❌ No se encontró invitado con ese código');
        return null;
    }).catch(function(error) {
        console.error('❌ Error al buscar en Firebase:', error);
        return null;
    });
}

// Inicializar la invitación
function initializeInvitation() {
    console.log('🚀 Inicializando invitación...');
    
    const code = getInvitationCode();
    
    if (!code) {
        console.log('❌ No hay código en la URL');
        const noInvitationEl = document.getElementById('noInvitation');
        if (noInvitationEl) {
            noInvitationEl.style.display = 'block';
        }
        return;
    }
    
    // Buscar invitado en Firebase
    findGuestByCode(code).then(function(guest) {
        if (!guest) {
            console.log('❌ Invitado no encontrado');
            const noInvitationEl = document.getElementById('noInvitation');
            if (noInvitationEl) {
                noInvitationEl.style.display = 'block';
            }
            return;
        }
        
        console.log('✅ Mostrando información del invitado');
        currentGuestId = guest.id;
        
        // Mostrar información del pase
        const invitationInfoEl = document.getElementById('invitationInfo');
        const guestNameEl = document.getElementById('guestNameDisplay');
        const passesEl = document.getElementById('passesDisplay');
        
        if (invitationInfoEl) invitationInfoEl.style.display = 'block';
        if (guestNameEl) guestNameEl.textContent = guest.name;
        if (passesEl) {
            const personasText = guest.passes === 1 ? 'Persona' : 'Personas';
            passesEl.textContent = guest.passes + ' ' + personasText;
        }
        
        // Mostrar estado actual
        updateConfirmationStatus(guest.status);
    });
}

// Actualizar estado de confirmación
function updateConfirmationStatus(status) {
    console.log('📝 Actualizando estado:', status);
    
    const statusContainer = document.getElementById('confirmationStatus');
    const confirmSection = document.getElementById('confirmationSection');
    
    if (!statusContainer || !confirmSection) {
        console.error('❌ No se encontraron los elementos de confirmación');
        return;
    }
    
    if (status === 'pending') {
        statusContainer.innerHTML = '';
        confirmSection.style.display = 'block';
    } else if (status === 'confirmed') {
        statusContainer.innerHTML = '<div style="background: #d4f4dd; color: #2d6a3e; padding: 15px; border-radius: 10px;">' +
            '<strong>✓ Asistencia Confirmada</strong>' +
            '<p style="margin-top: 5px; font-size: 0.9rem;">¡Nos vemos el 27 de Diciembre!</p>' +
            '</div>';
        confirmSection.style.display = 'none';
    } else if (status === 'declined') {
        statusContainer.innerHTML = '<div style="background: #ffebee; color: #c62828; padding: 15px; border-radius: 10px;">' +
            '<strong>✗ No podrás asistir</strong>' +
            '<p style="margin-top: 5px; font-size: 0.9rem;">Gracias por informarnos</p>' +
            '</div>';
        confirmSection.style.display = 'none';
    }
}

// ============================================
// BOTONES DE CONFIRMACIÓN
// ============================================

// Confirmar asistencia
const confirmBtn = document.getElementById('confirmBtn');
if (confirmBtn) {
    confirmBtn.addEventListener('click', function() {
        if (!currentGuestId) {
            console.error('❌ No hay ID de invitado');
            return;
        }
        
        if (confirm('¿Confirmas tu asistencia al evento?')) {
            console.log('✅ Confirmando asistencia...');
            
            database.ref('guests/' + currentGuestId).update({
                status: 'confirmed',
                confirmedAt: Date.now()
            }).then(function() {
                console.log('✅ Asistencia confirmada en Firebase');
                updateConfirmationStatus('confirmed');
                alert('¡Gracias por confirmar tu asistencia! 🎉');
            }).catch(function(error) {
                console.error('❌ Error al confirmar:', error);
                alert('Hubo un error al confirmar. Por favor intenta de nuevo.');
            });
        }
    });
} else {
    console.log('⚠️ No se encontró el botón de confirmar');
}

// Rechazar asistencia
const declineBtn = document.getElementById('declineBtn');
if (declineBtn) {
    declineBtn.addEventListener('click', function() {
        if (!currentGuestId) {
            console.error('❌ No hay ID de invitado');
            return;
        }
        
        if (confirm('¿Estás seguro de que no podrás asistir?')) {
            console.log('📝 Rechazando asistencia...');
            
            database.ref('guests/' + currentGuestId).update({
                status: 'declined',
                declinedAt: Date.now()
            }).then(function() {
                console.log('✅ Rechazo registrado en Firebase');
                updateConfirmationStatus('declined');
                alert('Gracias por informarnos.');
            }).catch(function(error) {
                console.error('❌ Error al rechazar:', error);
                alert('Hubo un error. Por favor intenta de nuevo.');
            });
        }
    });
} else {
    console.log('⚠️ No se encontró el botón de rechazar');
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado, inicializando...');
    initializeInvitation();
});

// ============================================
// GALERÍA (Lightbox)
// ============================================
const images = document.querySelectorAll(".gallery-item img");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

if (images && lightbox && lightboxImg) {
    images.forEach(function(img) {
        img.addEventListener("click", function() {
            lightbox.classList.add("active");
            lightboxImg.src = img.src;
        });
    });

    lightbox.addEventListener("click", function() {
        lightbox.classList.remove("active");
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// ANIMATION ON SCROLL
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(function(section) {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(section);
});