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

// Función simple de encriptación/desencriptación
function encodeInvitation(name, passes) {
    const data = `${name}|${passes}`;
    return btoa(encodeURIComponent(data));
}

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
        // Si hay un código, decodificarlo
        return decodeInvitation(code);
    }
    
    // Fallback al método anterior (por compatibilidad)
    return {
        name: params.get('name') || params.get('nombre'),
        passes: parseInt(params.get('passes') || params.get('pases')) || 1
    };
}

// Inicializar pase de entrada con datos de la URL
function initializeInvitation() {
    const invitation = getURLParams();
    
    if (invitation.name) {
        // Mostrar el pase de entrada
        document.getElementById('invitationInfo').style.display = 'block';
        document.getElementById('guestNameDisplay').textContent = invitation.name;
        document.getElementById('passesDisplay').textContent = `${invitation.passes} ${invitation.passes === 1 ? 'Persona' : 'Personas'}`;
    } else {
        // Mostrar mensaje si no hay invitación
        document.getElementById('noInvitation').style.display = 'block';
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', initializeInvitation);

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', initializeInvitation);

// Guestbook Form
const messages = [];

document.getElementById('guestbookForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('guestName').value;
    const message = document.getElementById('message').value;
    const date = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    
    const messageObj = { name, message, date };
    messages.unshift(messageObj);
    
    // Add message to container
    const messagesContainer = document.getElementById('messagesContainer');
    const messageCard = document.createElement('div');
    messageCard.className = 'message-card';
    messageCard.style.animation = 'fadeInUp 0.5s ease-out';
    messageCard.innerHTML = `
        <div class="message-header">
            <span class="message-name">${name}</span>
            <span class="message-date">${date}</span>
        </div>
        <div class="message-text">${message}</div>
    `;
    
    messagesContainer.insertBefore(messageCard, messagesContainer.firstChild);
    
    // Reset form
    this.reset();
    
    // Show confirmation
    alert('¡Gracias por tu mensaje! Ha sido publicado.');
});

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