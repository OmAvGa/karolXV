
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

        // Calendar Buttons
        document.getElementById('googleCalendar').addEventListener('click', function(e) {
            e.preventDefault();
            const title = encodeURIComponent('XV Años de Karol Dariana');
            const details = encodeURIComponent('Celebración de XV años de Karol');
            const location = encodeURIComponent('El Olvido');
            const startDate = '20251227T150000';
            const endDate = '20251227T220000';
            
            const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startDate}/${endDate}`;
            window.open(googleUrl, '_blank');
        });

        document.getElementById('appleCalendar').addEventListener('click', function(e) {
            e.preventDefault();
            const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:XV Años de Karol Dariana
DESCRIPTION:Celebración de XV años
LOCATION:Salón ---- El Olvido
DTSTART:20251227T150000
DTEND:20251227T220000
END:VEVENT
END:VCALENDAR`;
            
            const blob = new Blob([icsContent], { type: 'text/calendar' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'xv-anos-karol.ics';
            link.click();
        });

        // RSVP Form
        document.getElementById('rsvpForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                guests: document.getElementById('guests').value,
                dietary: document.getElementById('dietary').value
            };

            // Show success message
            const successMessage = document.getElementById('successMessage');
            successMessage.style.display = 'block';
            
            // Simulate email send (in production, this would connect to a backend)
            console.log('RSVP Data:', formData);
            
            // Reset form
            this.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        });

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