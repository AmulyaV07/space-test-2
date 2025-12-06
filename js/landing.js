// ====================================
// LANDING PAGE FUNCTIONALITY
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    
    // Animated Counters [web:61][web:63]
    const yearsCounter = document.getElementById('yearsCounter');
    const regionsCounter = document.getElementById('regionsCounter');
    const dataPointsCounter = document.getElementById('dataPointsCounter');
    
    if (yearsCounter && regionsCounter && dataPointsCounter) {
        setTimeout(() => {
            animateCounter(yearsCounter, 9, 1500);
            animateCounter(regionsCounter, 195, 2000);
            animateCounter(dataPointsCounter, 50000, 2500);
        }, 500);
    }
    
    // Feature Cards Hover Effect
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Use Case Cards Animation
    const useCaseCards = document.querySelectorAll('.use-case-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });
    
    useCaseCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
    
    // CTA Button Ripple Effect
    const ctaButton = document.querySelector('.btn-cta');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.6)';
            ripple.style.width = '100px';
            ripple.style.height = '100px';
            ripple.style.left = e.offsetX - 50 + 'px';
            ripple.style.top = e.offsetY - 50 + 'px';
            ripple.style.animation = 'ripple 0.6s ease-out';
            ripple.style.pointerEvents = 'none';
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }
    
    // Footer Links
    const docsLink = document.getElementById('docsLink');
    const apiLink = document.getElementById('apiLink');
    
    if (docsLink) {
        docsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('📚 Documentation coming soon!', 'info');
        });
    }
    
    if (apiLink) {
        apiLink.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('🔌 API access will be available in beta!', 'info');
        });
    }
});

// Ripple Animation CSS (dynamically added)
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        from {
            transform: scale(0);
            opacity: 1;
        }
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
