// ============================================
// CONFIGURACIÓN DE FIREBASE
// ============================================
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

// Variable global para la base de datos
let database;

// Inicializar Firebase cuando la página cargue
window.addEventListener('load', function() {
    console.log('🚀 Iniciando aplicación...');
    
    // Verificar que Firebase esté disponible
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase no está cargado. Asegúrate de incluir los scripts de Firebase en el HTML.');
        alert('Error: Firebase no está disponible. Verifica la conexión.');
        return;
    }
    
    // Inicializar Firebase
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase inicializado correctamente');
        } else {
            console.log('✅ Firebase ya estaba inicializado');
        }
        
        database = firebase.database();
        console.log('✅ Database conectada');
        
        // Inicializar la invitación después de que Firebase esté listo
        initializeInvitation();
        
    } catch (error) {
        console.error('❌ Error al inicializar Firebase:', error);
        alert('Error al conectar con la base de datos: ' + error.message);
    }
});

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

// Iniciar countdown inmediatamente
updateCountdown();
setInterval(updateCountdown, 1000);

// ============================================
// FUNCIONES DE INVITACIÓN
// ============================================
let currentGuestId = null;

// Obtener código de la URL
function getInvitationCode() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || params.get('codigo');
    console.log('📋 Código obtenido de URL:', code);
    return code;
}

// Buscar invitado en Firebase por código
function findGuestByCode(invitationCode) {
    console.log('🔍 Buscando invitado con código:', invitationCode);
    
    return database.ref('guests').once('value')
        .then(function(snapshot) {
            const guests = snapshot.val();
            console.log('📊 Total de invitados en DB:', guests ? Object.keys(guests).length : 0);
            
            if (!guests) {
                console.log('❌ No hay invitados en la base de datos');
                return null;
            }
            
            // Buscar el invitado con el código
            for (let guestId in guests) {
                const guest = guests[guestId];
                console.log('Comparando:', guest.invitationCode, 'con', invitationCode);
                
                if (guest.invitationCode === invitationCode) {
                    console.log('✅ ¡Invitado encontrado!', guest);
                    return { 
                        id: guestId, 
                        ...guest 
                    };
                }
            }
            
            console.log('❌ No se encontró invitado con ese código');
            return null;
        })
        .catch(function(error) {
            console.error('❌ Error al buscar en Firebase:', error);
            return null;
        });
}

// Mostrar información del invitado
function showGuestInfo(guest) {
    console.log('📋 Mostrando información del invitado:', guest);
    
    const invitationInfoEl = document.getElementById('invitationInfo');
    const guestNameEl = document.getElementById('guestNameDisplay');
    const passesEl = document.getElementById('passesDisplay');
    const noInvitationEl = document.getElementById('noInvitation');
    
    // Ocultar mensaje de "no invitación"
    if (noInvitationEl) {
        noInvitationEl.style.display = 'none';
    }
    
    // Mostrar información del pase
    if (invitationInfoEl) {
        invitationInfoEl.style.display = 'block';
    }
    
    if (guestNameEl) {
        guestNameEl.textContent = guest.name;
        console.log('✅ Nombre mostrado:', guest.name);
    }
    
    if (passesEl) {
        const personasText = guest.passes === 1 ? 'Persona' : 'Personas';
        passesEl.textContent = guest.passes + ' ' + personasText;
        console.log('✅ Pases mostrados:', guest.passes);
    }
    
    // Guardar ID del invitado
    currentGuestId = guest.id;
    
    // Mostrar estado actual
    updateConfirmationStatus(guest.status || 'pending');
}

// Mostrar mensaje de invitación no válida
function showNoInvitation() {
    console.log('❌ Mostrando mensaje de invitación no válida');
    
    const invitationInfoEl = document.getElementById('invitationInfo');
    const noInvitationEl = document.getElementById('noInvitation');
    
    if (invitationInfoEl) {
        invitationInfoEl.style.display = 'none';
    }
    
    if (noInvitationEl) {
        noInvitationEl.style.display = 'block';
    }
}

// Actualizar estado de confirmación
function updateConfirmationStatus(status) {
    console.log('📝 Actualizando estado de confirmación:', status);
    
    const statusContainer = document.getElementById('confirmationStatus');
    const confirmSection = document.getElementById('confirmationSection');
    
    if (!statusContainer) {
        console.error('❌ No se encontró confirmationStatus');
        return;
    }
    
    if (!confirmSection) {
        console.error('❌ No se encontró confirmationSection');
        return;
    }
    
    if (status === 'pending') {
        console.log('⏳ Estado: Pendiente - Mostrando botones');
        statusContainer.innerHTML = '';
        confirmSection.style.display = 'block';
    } else if (status === 'confirmed') {
        console.log('✅ Estado: Confirmado');
        statusContainer.innerHTML = 
            '<div style="background: #d4f4dd; color: #2d6a3e; padding: 15px; border-radius: 10px; margin-bottom: 10px;">' +
            '<strong style="font-size: 1.2rem;">✓ Asistencia Confirmada</strong>' +
            '<p style="margin-top: 5px; font-size: 0.95rem;">¡Nos vemos el 27 de Diciembre!</p>' +
            '</div>';
        confirmSection.style.display = 'none';
    } else if (status === 'declined') {
        console.log('❌ Estado: Rechazado');
        statusContainer.innerHTML = 
            '<div style="background: #ffebee; color: #c62828; padding: 15px; border-radius: 10px; margin-bottom: 10px;">' +
            '<strong style="font-size: 1.2rem;">✗ No podrás asistir</strong>' +
            '<p style="margin-top: 5px; font-size: 0.95rem;">Gracias por informarnos</p>' +
            '</div>';
        confirmSection.style.display = 'none';
    }
}

// Inicializar la invitación
function initializeInvitation() {
    console.log('🎯 Iniciando proceso de invitación...');
    
    const code = getInvitationCode();
    
    if (!code) {
        console.log('⚠️ No hay código en la URL');
        showNoInvitation();
        return;
    }
    
    console.log('✅ Código encontrado, buscando invitado...');
    
    // Buscar invitado en Firebase
    findGuestByCode(code)
        .then(function(guest) {
            if (!guest) {
                console.log('❌ Invitado no encontrado');
                showNoInvitation();
                return;
            }
            
            console.log('✅ Invitado encontrado, mostrando información');
            showGuestInfo(guest);
        })
        .catch(function(error) {
            console.error('❌ Error al inicializar invitación:', error);
            showNoInvitation();
        });
}

// ============================================
// BOTONES DE CONFIRMACIÓN
// ============================================

// Función para confirmar asistencia
function confirmAttendance() {
    if (!currentGuestId) {
        console.error('❌ No hay ID de invitado');
        alert('Error: No se pudo identificar la invitación');
        return;
    }
    
    if (!database) {
        console.error('❌ Database no está disponible');
        alert('Error: No hay conexión con la base de datos');
        return;
    }
    
    if (confirm('¿Confirmas tu asistencia al evento?')) {
        console.log('✅ Confirmando asistencia para:', currentGuestId);
        
        database.ref('guests/' + currentGuestId).update({
            status: 'confirmed',
            confirmedAt: Date.now()
        })
        .then(function() {
            console.log('✅ Asistencia confirmada exitosamente');
            updateConfirmationStatus('confirmed');
            alert('¡Gracias por confirmar tu asistencia! 🎉');
        })
        .catch(function(error) {
            console.error('❌ Error al confirmar:', error);
            alert('Hubo un error al confirmar. Por favor intenta de nuevo.');
        });
    }
}

// Función para rechazar asistencia
function declineAttendance() {
    if (!currentGuestId) {
        console.error('❌ No hay ID de invitado');
        alert('Error: No se pudo identificar la invitación');
        return;
    }
    
    if (!database) {
        console.error('❌ Database no está disponible');
        alert('Error: No hay conexión con la base de datos');
        return;
    }
    
    if (confirm('¿Estás seguro de que no podrás asistir?')) {
        console.log('📝 Rechazando asistencia para:', currentGuestId);
        
        database.ref('guests/' + currentGuestId).update({
            status: 'declined',
            declinedAt: Date.now()
        })
        .then(function() {
            console.log('✅ Rechazo registrado exitosamente');
            updateConfirmationStatus('declined');
            alert('Gracias por informarnos.');
        })
        .catch(function(error) {
            console.error('❌ Error al rechazar:', error);
            alert('Hubo un error. Por favor intenta de nuevo.');
        });
    }
}

// Event listeners para los botones
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM completamente cargado');
    
    const confirmBtn = document.getElementById('confirmBtn');
    const declineBtn = document.getElementById('declineBtn');
    
    if (confirmBtn) {
        console.log('✅ Botón confirmar encontrado');
        confirmBtn.addEventListener('click', confirmAttendance);
    } else {
        console.log('⚠️ Botón confirmar NO encontrado');
    }
    
    if (declineBtn) {
        console.log('✅ Botón rechazar encontrado');
        declineBtn.addEventListener('click', declineAttendance);
    } else {
        console.log('⚠️ Botón rechazar NO encontrado');
    }
});

// ============================================
// GALERÍA (Lightbox)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
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
});

// ============================================
// SMOOTH SCROLL
// ============================================
document.addEventListener('DOMContentLoaded', function() {
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
});

// ============================================
// ANIMATION ON SCROLL
// ============================================
document.addEventListener('DOMContentLoaded', function() {
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
});