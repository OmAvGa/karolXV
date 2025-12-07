// Configuración de Firebase (DEBE SER LA MISMA QUE EN admin.js)
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


// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Countdown Timer
const eventDate = new Date('2025-12-27T15:00:00').getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;

    if (distance < 0) {
        document.getElementById('countdown').innerHTML = '<p style="font-size: 2rem;">¡El evento ha comenzado!</p>';
    }
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Función de decodificación
function decodeInvitation(code) {
    try {
        const decoded = decodeURIComponent(atob(code));
        const [name, passes] = decoded.split('|');
        return { name, passes: parseInt(passes) };
    } catch (e) {
        return null;
    }
}

// Obtener parámetros de la URL
function getURLParams() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || params.get('codigo');
    
    if (code) {
        return { code, ...decodeInvitation(code) };
    }
    
    return null;
}

let currentGuestId = null;

// Buscar invitado en Firebase por código
async function findGuestByCode(invitationCode) {
    try {
        const snapshot = await database.ref('guests').once('value');
        const guests = snapshot.val();
        
        if (!guests) return null;
        
        for (let guestId in guests) {
            if (guests[guestId].invitationCode === invitationCode) {
                return { id: guestId, ...guests[guestId] };
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error al buscar invitado:', error);
        return null;
    }
}

// Inicializar pase de entrada
async function initializeInvitation() {
    const params = getURLParams();
    
    if (!params || !params.code) {
        document.getElementById('noInvitation').style.display = 'block';
        return;
    }
    
    // Buscar invitado en Firebase
    const guest = await findGuestByCode(params.code);
    
    if (!guest) {
        document.getElementById('noInvitation').style.display = 'block';
        return;
    }
    
    currentGuestId = guest.id;
    
    // Mostrar información del pase
    document.getElementById('invitationInfo').style.display = 'block';
    document.getElementById('guestNameDisplay').textContent = guest.name;
    document.getElementById('passesDisplay').textContent = `${guest.passes} ${guest.passes === 1 ? 'Persona' : 'Personas'}`;
    
    // Mostrar estado actual
    updateConfirmationStatus(guest.status);
}

// Actualizar estado de confirmación
function updateConfirmationStatus(status) {
    const statusContainer = document.getElementById('confirmationStatus');
    const confirmSection = document.getElementById('confirmationSection');
    
    if (status === 'pending') {
        statusContainer.innerHTML = '';
        confirmSection.style.display = 'block';
    } else if (status === 'confirmed') {
        statusContainer.innerHTML = `
            <div style="background: #d4f4dd; color: #2d6a3e; padding: 15px; border-radius: 10px;">
                <strong>✓ Asistencia Confirmada</strong>
                <p style="margin-top: 5px; font-size: 0.9rem;">¡Nos vemos el 27 de Diciembre!</p>
            </div>
        `;
        confirmSection.style.display = 'none';
    } else if (status === 'declined') {
        statusContainer.innerHTML = `
            <div style="background: #ffebee; color: #c62828; padding: 15px; border-radius: 10px;">
                <strong>✗ No podrás asistir</strong>
                <p style="margin-top: 5px; font-size: 0.9rem;">Gracias por informarnos</p>
            </div>
        `;
        confirmSection.style.display = 'none';
    }
}

// Confirmar asistencia
document.getElementById('confirmBtn')?.addEventListener('click', async () => {
    if (!currentGuestId) return;
    
    if (confirm('¿Confirmas tu asistencia al evento?')) {
        try {
            await database.ref('guests/' + currentGuestId).update({
                status: 'confirmed',
                confirmedAt: Date.now()
            });
            
            updateConfirmationStatus('confirmed');
            alert('¡Gracias por confirmar tu asistencia! 🎉');
            
        } catch (error) {
            console.error('Error al confirmar:', error);
            alert('Hubo un error al confirmar. Por favor intenta de nuevo.');
        }
    }
});

// Rechazar asistencia
document.getElementById('declineBtn')?.addEventListener('click', async () => {
    if (!currentGuestId) return;
    
    if (confirm('¿Estás seguro de que no podrás asistir?')) {
        try {
            await database.ref('guests/' + currentGuestId).update({
                status: 'declined',
                declinedAt: Date.now()
            });
            
            updateConfirmationStatus('declined');
            alert('Gracias por informarnos.');
            
        } catch (error) {
            console.error('Error al rechazar:', error);
            alert('Hubo un error. Por favor intenta de nuevo.');
        }
    }
});

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', initializeInvitation);

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(section);
});