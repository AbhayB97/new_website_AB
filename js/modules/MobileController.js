// Mobile Controller - Handles mobile-specific interactions and UI
export class MobileController {
    constructor() {
        // Mobile state
        this.isMobileMenuOpen = false;
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.lastTouchY = 0;
        this.velocityY = 0;
        this.isGestureActive = false;
        
        // DOM elements
        this.menuToggle = null;
        this.mobileNav = null;
        this.terminalOverlay = null;
        
        // Gesture recognition
        this.gestureThreshold = 50;
        this.swipeVelocityThreshold = 0.5;
        
        this.init();
    }
    
    init() {
        console.log('📱 Initializing Mobile Controller...');
        
        // Get DOM references
        this.getDOMReferences();
        
        // Setup mobile-specific styles
        this.setupMobileStyles();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup gesture recognition
        this.setupGestureRecognition();
        
        // Handle orientation changes
        this.handleOrientationChange();
        
        console.log('✅ Mobile Controller initialized');
    }
    
    getDOMReferences() {
        this.menuToggle = document.getElementById('mobile-menu-toggle');
        this.mobileNav = document.getElementById('mobile-nav');
        this.terminalOverlay = document.getElementById('terminal-overlay');
        
        if (!this.menuToggle || !this.mobileNav) {
            console.warn('Mobile menu elements not found');
        }
    }
    
    setupMobileStyles() {
        // Add mobile-specific CSS classes
        document.body.classList.add('mobile-device');
        
        // Adjust viewport meta tag for better mobile experience
        let viewport = document.querySelector("meta[name=viewport]");
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        
        // Prevent zoom on input focus
        if (this.terminalOverlay) {
            const terminalInput = this.terminalOverlay.querySelector('#terminal-input');
            if (terminalInput) {
                terminalInput.style.fontSize = '16px'; // Prevents zoom on iOS
            }
        }
    }
    
    setupEventListeners() {
        // Menu toggle
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
            this.menuToggle.addEventListener('touchstart', this.handleMenuTouchStart.bind(this));
        }
        
        // Navigation links
        if (this.mobileNav) {
            this.mobileNav.addEventListener('click', this.handleNavClick.bind(this));
        }
        
        // Orientation change
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Prevent default touch behaviors
        document.addEventListener('touchstart', this.preventDefaultTouch.bind(this), { passive: false });
        document.addEventListener('touchmove', this.preventDefaultTouch.bind(this), { passive: false });
        
        // Handle device motion for subtle effects
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', this.handleDeviceMotion.bind(this));
        }
    }
    
    setupGestureRecognition() {
        // Swipe gestures for navigation
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        
        // Pinch gestures (for future zoom functionality)
        document.addEventListener('gesturestart', this.handleGestureStart.bind(this), { passive: false });
        document.addEventListener('gesturechange', this.handleGestureChange.bind(this), { passive: false });
        document.addEventListener('gestureend', this.handleGestureEnd.bind(this), { passive: false });
    }
    
    handleTouchStart(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.touchStartY = touch.clientY;
            this.touchStartX = touch.clientX;
            this.lastTouchY = touch.clientY;
            this.velocityY = 0;
            this.lastTouchTime = Date.now();
        }
    }
    
    handleTouchMove(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const currentY = touch.clientY;
            const currentTime = Date.now();
            
            // Calculate velocity
            const deltaY = currentY - this.lastTouchY;
            const deltaTime = currentTime - this.lastTouchTime;
            this.velocityY = deltaY / deltaTime;
            
            this.lastTouchY = currentY;
            this.lastTouchTime = currentTime;
            
            // Detect swipe gestures
            this.detectSwipeGesture(event);
        }
    }
    
    handleTouchEnd(event) {
        if (this.isGestureActive) {
            this.processGesture();
            this.isGestureActive = false;
        }
    }
    
    detectSwipeGesture(event) {
        const deltaY = this.lastTouchY - this.touchStartY;
        const deltaX = event.touches[0].clientX - this.touchStartX;
        
        // Check if this is a vertical swipe
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > this.gestureThreshold) {
            this.isGestureActive = true;
            
            // Prevent default scrolling for gesture area
            const isInTerminalArea = event.target.closest('#terminal-overlay');
            if (!isInTerminalArea) {
                event.preventDefault();
            }
        }
    }
    
    processGesture() {
        const deltaY = this.lastTouchY - this.touchStartY;
        
        // Determine gesture type
        if (Math.abs(this.velocityY) > this.swipeVelocityThreshold) {
            if (this.velocityY < 0) {
                // Fast swipe up
                this.handleSwipeUp();
            } else {
                // Fast swipe down
                this.handleSwipeDown();
            }
        } else if (Math.abs(deltaY) > this.gestureThreshold * 2) {
            if (deltaY < 0) {
                // Slow swipe up
                this.handleSlowSwipeUp();
            } else {
                // Slow swipe down
                this.handleSlowSwipeDown();
            }
        }
    }
    
    handleSwipeUp() {
        // Quick navigation forward
        if (window.portfolioApp && window.portfolioApp.scrollController) {
            window.portfolioApp.scrollController.scrollToNext();
        }
        
        this.showSwipeHint('Swiped up - Next section');
    }
    
    handleSwipeDown() {
        // Quick navigation backward
        if (window.portfolioApp && window.portfolioApp.scrollController) {
            window.portfolioApp.scrollController.scrollToPrevious();
        }
        
        this.showSwipeHint('Swiped down - Previous section');
    }
    
    handleSlowSwipeUp() {
        // Gradual scroll forward
        this.showSwipeHint('Scrolling forward...');
    }
    
    handleSlowSwipeDown() {
        // Gradual scroll backward
        this.showSwipeHint('Scrolling backward...');
    }
    
    showSwipeHint(message) {
        // Create temporary hint overlay
        const hint = document.createElement('div');
        hint.className = 'mobile-swipe-hint';
        hint.textContent = message;
        hint.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 65, 0.1);
            border: 1px solid rgba(0, 255, 65, 0.3);
            padding: 10px 20px;
            border-radius: 5px;
            color: #00ff41;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(hint);
        
        // Animate in
        setTimeout(() => hint.style.opacity = '1', 10);
        
        // Remove after delay
        setTimeout(() => {
            hint.style.opacity = '0';
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 300);
        }, 1500);
    }
    
    handleGestureStart(event) {
        event.preventDefault();
        // Handle pinch start (for future zoom functionality)
    }
    
    handleGestureChange(event) {
        event.preventDefault();
        // Handle pinch change
    }
    
    handleGestureEnd(event) {
        event.preventDefault();
        // Handle pinch end
    }
    
    handleMenuTouchStart(event) {
        // Add touch feedback
        event.currentTarget.style.transform = 'scale(0.95)';
        setTimeout(() => {
            event.currentTarget.style.transform = 'scale(1)';
        }, 150);
    }
    
    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        
        if (this.mobileNav) {
            if (this.isMobileMenuOpen) {
                this.mobileNav.classList.add('active');
                this.animateMenuOpen();
            } else {
                this.mobileNav.classList.remove('active');
                this.animateMenuClose();
            }
        }
        
        // Update toggle button state
        this.updateMenuToggleState();
    }
    
    updateMenuToggleState() {
        if (this.menuToggle) {
            const spans = this.menuToggle.querySelectorAll('span');
            if (this.isMobileMenuOpen) {
                // Transform to X
                spans[0].style.transform = 'rotate(45deg) translateY(8px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
                this.menuToggle.setAttribute('aria-expanded', 'true');
            } else {
                // Transform to hamburger
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
                this.menuToggle.setAttribute('aria-expanded', 'false');
            }
        }
    }
    
    animateMenuOpen() {
        if (this.mobileNav) {
            // Slide in animation
            this.mobileNav.style.transform = 'translateX(0)';
            
            // Stagger animation for menu items
            const menuItems = this.mobileNav.querySelectorAll('li');
            menuItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(20px)';
                
                setTimeout(() => {
                    item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, index * 100);
            });
        }
    }
    
    animateMenuClose() {
        if (this.mobileNav) {
            const menuItems = this.mobileNav.querySelectorAll('li');
            menuItems.forEach((item) => {
                item.style.transition = 'none';
                item.style.opacity = '';
                item.style.transform = '';
            });
        }
    }
    
    handleNavClick(event) {
        // Close menu when navigation item is clicked
        if (event.target.tagName === 'A') {
            this.toggleMobileMenu();
        }
    }
    
    handleOrientationChange() {
        // Adjust layout for orientation change
        setTimeout(() => {
            this.adjustForOrientation();
            
            // Trigger resize on scene manager
            if (window.portfolioApp && window.portfolioApp.sceneManager) {
                window.portfolioApp.sceneManager.handleResize();
            }
        }, 500); // Delay to ensure orientation change is complete
    }
    
    adjustForOrientation() {
        const isLandscape = window.orientation === 90 || window.orientation === -90;
        
        if (isLandscape) {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
            
            // Adjust terminal for landscape
            if (this.terminalOverlay) {
                this.terminalOverlay.style.fontSize = '12px';
            }
        } else {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
            
            // Adjust terminal for portrait
            if (this.terminalOverlay) {
                this.terminalOverlay.style.fontSize = '14px';
            }
        }
    }
    
    handleResize() {
        // Close mobile menu on resize
        if (this.isMobileMenuOpen) {
            this.toggleMobileMenu();
        }
        
        // Update mobile styles if needed
        this.updateMobileLayout();
    }
    
    updateMobileLayout() {
        // Adjust for different mobile screen sizes
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Handle small screens (iPhone SE, etc.)
        if (viewportHeight < 600) {
            document.body.classList.add('small-screen');
        } else {
            document.body.classList.remove('small-screen');
        }
        
        // Handle very wide screens (tablets in landscape)
        if (viewportWidth > 900) {
            document.body.classList.add('tablet-landscape');
        } else {
            document.body.classList.remove('tablet-landscape');
        }
    }
    
    handleDeviceMotion(event) {
        // Subtle parallax effect based on device motion
        if (event.accelerationIncludingGravity) {
            const x = event.accelerationIncludingGravity.x;
            const y = event.accelerationIncludingGravity.y;
            
            // Apply subtle motion effects to background elements
            this.applyMotionParallax(x, y);
        }
    }
    
    applyMotionParallax(x, y) {
        // Apply subtle motion-based parallax to background elements
        const parallaxFactor = 0.5;
        const maxOffset = 5;
        
        const offsetX = Math.max(-maxOffset, Math.min(maxOffset, x * parallaxFactor));
        const offsetY = Math.max(-maxOffset, Math.min(maxOffset, y * parallaxFactor));
        
        // Apply to background grid or particles if they exist
        if (window.portfolioApp && window.portfolioApp.sceneManager) {
            const sceneManager = window.portfolioApp.sceneManager;
            if (sceneManager.backgroundGrid) {
                sceneManager.backgroundGrid.position.x = offsetX * 0.1;
                sceneManager.backgroundGrid.position.z = offsetY * 0.1;
            }
        }
    }
    
    preventDefaultTouch(event) {
        // Prevent default touch behaviors that might interfere
        const target = event.target;
        
        // Allow scrolling in terminal output
        if (target.closest('#terminal-output')) {
            return;
        }
        
        // Allow input in terminal
        if (target.matches('#terminal-input')) {
            return;
        }
        
        // Allow navigation menu interactions
        if (target.closest('#mobile-nav')) {
            return;
        }
        
        // Prevent other touch behaviors
        if (event.touches && event.touches.length > 1) {
            event.preventDefault(); // Prevent multi-touch
        }
    }
    
    // Public API methods
    openMobileMenu() {
        if (!this.isMobileMenuOpen) {
            this.toggleMobileMenu();
        }
    }
    
    closeMobileMenu() {
        if (this.isMobileMenuOpen) {
            this.toggleMobileMenu();
        }
    }
    
    isMenuOpen() {
        return this.isMobileMenuOpen;
    }
    
    enableGestures() {
        this.gesturesEnabled = true;
    }
    
    disableGestures() {
        this.gesturesEnabled = false;
    }
    
    dispose() {
        // Remove event listeners
        if (this.menuToggle) {
            this.menuToggle.removeEventListener('click', this.toggleMobileMenu);
            this.menuToggle.removeEventListener('touchstart', this.handleMenuTouchStart);
        }
        
        if (this.mobileNav) {
            this.mobileNav.removeEventListener('click', this.handleNavClick);
        }
        
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('devicemotion', this.handleDeviceMotion);
        
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
        document.removeEventListener('touchstart', this.preventDefaultTouch);
        document.removeEventListener('touchmove', this.preventDefaultTouch);
        
        document.removeEventListener('gesturestart', this.handleGestureStart);
        document.removeEventListener('gesturechange', this.handleGestureChange);
        document.removeEventListener('gestureend', this.handleGestureEnd);
        
        // Remove mobile classes
        document.body.classList.remove('mobile-device', 'landscape', 'portrait', 'small-screen', 'tablet-landscape');
    }
}
