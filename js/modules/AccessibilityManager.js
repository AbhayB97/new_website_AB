// Accessibility Manager - Handles accessibility features and compliance
export class AccessibilityManager {
    constructor() {
        // Accessibility state
        this.isScreenReaderActive = false;
        this.isHighContrastMode = false;
        this.isReducedMotionPreferred = false;
        this.isKeyboardNavigation = false;
        
        // Focus management
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.lastFocusedElement = null;
        
        // ARIA live regions
        this.liveRegion = null;
        this.statusRegion = null;
        
        this.init();
    }
    
    init() {
        console.log('♿ Initializing Accessibility Manager...');
        
        // Detect user preferences
        this.detectUserPreferences();
        
        // Setup ARIA live regions
        this.setupLiveRegions();
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
        
        // Setup focus management
        this.setupFocusManagement();
        
        // Setup screen reader support
        this.setupScreenReaderSupport();
        
        // Setup high contrast support
        this.setupHighContrastSupport();
        
        // Setup reduced motion support
        this.setupReducedMotionSupport();
        
        console.log('✅ Accessibility Manager initialized');
    }
    
    detectUserPreferences() {
        // Detect reduced motion preference
        this.isReducedMotionPreferred = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Detect high contrast preference
        this.isHighContrastMode = window.matchMedia('(prefers-contrast: high)').matches;
        
        // Detect screen reader (rough detection)
        this.isScreenReaderActive = this.detectScreenReader();
        
        console.log('Accessibility preferences:', {
            reducedMotion: this.isReducedMotionPreferred,
            highContrast: this.isHighContrastMode,
            screenReader: this.isScreenReaderActive
        });
    }
    
    detectScreenReader() {
        // Multiple methods to detect screen reader usage
        
        // Check for common screen reader indicators
        if (navigator.userAgent.includes('NVDA') || 
            navigator.userAgent.includes('JAWS') || 
            navigator.userAgent.includes('VoiceOver')) {
            return true;
        }
        
        // Check for Windows Narrator
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            return true;
        }
        
        // Check for reduced motion as an indicator
        if (this.isReducedMotionPreferred) {
            return true;
        }
        
        // Check if user is navigating with keyboard only
        document.addEventListener('mousedown', () => {
            this.isKeyboardNavigation = false;
        });
        
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                this.isKeyboardNavigation = true;
            }
        });
        
        return false;
    }
    
    setupLiveRegions() {
        // Create ARIA live region for announcements
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only';
        this.liveRegion.id = 'aria-live-region';
        document.body.appendChild(this.liveRegion);
        
        // Create status region for status updates
        this.statusRegion = document.createElement('div');
        this.statusRegion.setAttribute('aria-live', 'assertive');
        this.statusRegion.setAttribute('aria-atomic', 'true');
        this.statusRegion.className = 'sr-only';
        this.statusRegion.id = 'aria-status-region';
        document.body.appendChild(this.statusRegion);
    }
    
    setupKeyboardNavigation() {
        // Global keyboard event handlers
        document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
        
        // Track focus for keyboard navigation
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
        document.addEventListener('focusout', this.handleFocusOut.bind(this));
        
        // Update focusable elements list
        this.updateFocusableElements();
        
        // Re-scan for focusable elements when DOM changes
        const observer = new MutationObserver(() => {
            this.updateFocusableElements();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['tabindex', 'disabled', 'aria-hidden']
        });
    }
    
    updateFocusableElements() {
        const focusableSelector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[role="button"]:not([disabled])',
            '[role="link"]:not([disabled])'
        ].join(', ');
        
        this.focusableElements = Array.from(document.querySelectorAll(focusableSelector))
            .filter(el => {
                return el.offsetParent !== null && // Element is visible
                       !el.hasAttribute('aria-hidden') &&
                       !el.closest('[aria-hidden="true"]');
            });
    }
    
    handleGlobalKeydown(event) {
        switch (event.key) {
            case 'Tab':
                this.handleTabNavigation(event);
                break;
                
            case 'Escape':
                this.handleEscapeKey(event);
                break;
                
            case 'Enter':
            case ' ': // Space
                this.handleActivationKey(event);
                break;
                
            case 'ArrowDown':
            case 'ArrowUp':
            case 'ArrowLeft':
            case 'ArrowRight':
                this.handleArrowKeys(event);
                break;
        }
    }
    
    handleTabNavigation(event) {
        // Custom tab navigation for complex components
        const activeElement = document.activeElement;
        
        // Special handling for terminal
        if (activeElement && activeElement.closest('#terminal-overlay')) {
            // Let terminal handle its own tab navigation
            return;
        }
        
        // Special handling for 3D scene
        if (activeElement && activeElement.closest('#canvas-container')) {
            event.preventDefault();
            this.navigateToNextInteractiveElement(event.shiftKey);
        }
    }
    
    navigateToNextInteractiveElement(reverse = false) {
        // Find next focusable element in the page
        let nextIndex;
        
        if (this.currentFocusIndex === -1) {
            nextIndex = reverse ? this.focusableElements.length - 1 : 0;
        } else {
            nextIndex = reverse ? 
                this.currentFocusIndex - 1 : 
                this.currentFocusIndex + 1;
        }
        
        // Wrap around
        if (nextIndex >= this.focusableElements.length) {
            nextIndex = 0;
        } else if (nextIndex < 0) {
            nextIndex = this.focusableElements.length - 1;
        }
        
        const nextElement = this.focusableElements[nextIndex];
        if (nextElement) {
            nextElement.focus();
            this.currentFocusIndex = nextIndex;
        }
    }
    
    handleEscapeKey(event) {
        // Global escape key handling
        if (window.portfolioApp) {
            // Exit tour mode
            if (window.portfolioApp.sceneManager && window.portfolioApp.sceneManager.isTourMode) {
                window.portfolioApp.sceneManager.exitTourMode();
                this.announce('Exited tour mode');
            }
            
            // Minimize terminal
            else if (window.portfolioApp.terminalUI && !window.portfolioApp.terminalUI.isMinimized) {
                window.portfolioApp.terminalUI.minimize();
                this.announce('Terminal minimized');
            }
        }
    }
    
    handleActivationKey(event) {
        const target = event.target;
        
        // Handle custom interactive elements
        if (target.hasAttribute('role') && 
            (target.getAttribute('role') === 'button' || target.getAttribute('role') === 'link')) {
            event.preventDefault();
            target.click();
        }
    }
    
    handleArrowKeys(event) {
        // Custom arrow key navigation for complex components
        const activeElement = document.activeElement;
        
        // Handle 3D scene navigation
        if (activeElement && activeElement.closest('#canvas-container')) {
            event.preventDefault();
            this.handle3DSceneNavigation(event.key);
        }
    }
    
    handle3DSceneNavigation(key) {
        // Provide keyboard navigation for 3D scene
        if (window.portfolioApp && window.portfolioApp.sceneManager) {
            const sceneManager = window.portfolioApp.sceneManager;
            
            switch (key) {
                case 'ArrowUp':
                    this.announce('Moving forward in scene');
                    break;
                case 'ArrowDown':
                    this.announce('Moving backward in scene');
                    break;
                case 'ArrowLeft':
                    this.announce('Moving left in scene');
                    break;
                case 'ArrowRight':
                    this.announce('Moving right in scene');
                    break;
            }
        }
    }
    
    handleFocusIn(event) {
        const target = event.target;
        this.lastFocusedElement = target;
        
        // Update current focus index
        this.currentFocusIndex = this.focusableElements.indexOf(target);
        
        // Announce focus changes for complex elements
        this.announceFocusChange(target);
    }
    
    handleFocusOut(event) {
        // Handle focus out if needed
    }
    
    announceFocusChange(element) {
        let announcement = '';
        
        // Get element description
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        const title = element.getAttribute('title');
        const textContent = element.textContent?.trim();
        
        if (ariaLabel) {
            announcement = ariaLabel;
        } else if (ariaLabelledBy) {
            const labelElement = document.getElementById(ariaLabelledBy);
            if (labelElement) {
                announcement = labelElement.textContent?.trim() || '';
            }
        } else if (title) {
            announcement = title;
        } else if (textContent && textContent.length < 100) {
            announcement = textContent;
        }
        
        // Add role information
        const role = element.getAttribute('role') || element.tagName.toLowerCase();
        if (role === 'button') {
            announcement += ', button';
        } else if (role === 'link') {
            announcement += ', link';
        }
        
        // Announce if we have content
        if (announcement) {
            this.announce(announcement);
        }
    }
    
    setupFocusManagement() {
        // Ensure proper focus management for SPA-like behavior
        
        // Focus trap for modal-like components
        this.setupFocusTrap();
        
        // Focus indicators for keyboard navigation
        this.setupFocusIndicators();
    }
    
    setupFocusTrap() {
        // Implement focus trap for terminal when in focus mode
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                const terminalOverlay = document.getElementById('terminal-overlay');
                if (terminalOverlay && terminalOverlay.contains(document.activeElement)) {
                    // Keep focus within terminal
                    const focusableInTerminal = terminalOverlay.querySelectorAll(
                        'input, button, [tabindex]:not([tabindex="-1"])'
                    );
                    
                    if (focusableInTerminal.length > 0) {
                        const firstFocusable = focusableInTerminal[0];
                        const lastFocusable = focusableInTerminal[focusableInTerminal.length - 1];
                        
                        if (event.shiftKey && document.activeElement === firstFocusable) {
                            event.preventDefault();
                            lastFocusable.focus();
                        } else if (!event.shiftKey && document.activeElement === lastFocusable) {
                            event.preventDefault();
                            firstFocusable.focus();
                        }
                    }
                }
            }
        });
    }
    
    setupFocusIndicators() {
        // Enhanced focus indicators for better visibility
        const style = document.createElement('style');
        style.textContent = `
            .accessibility-focus-visible {
                outline: 3px solid #00ff41 !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 2px rgba(0, 255, 65, 0.3) !important;
            }
            
            /* High contrast mode styles */
            @media (prefers-contrast: high) {
                .accessibility-focus-visible {
                    outline: 4px solid #ffffff !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Apply focus indicators
        document.addEventListener('focusin', (event) => {
            if (this.isKeyboardNavigation) {
                event.target.classList.add('accessibility-focus-visible');
            }
        });
        
        document.addEventListener('focusout', (event) => {
            event.target.classList.remove('accessibility-focus-visible');
        });
    }
    
    setupScreenReaderSupport() {
        // Enhanced screen reader support
        
        // Provide alternative descriptions for 3D content
        this.setup3DDescriptions();
        
        // Provide progress announcements
        this.setupProgressAnnouncements();
        
        // Provide navigation assistance
        this.setupNavigationAssistance();
    }
    
    setup3DDescriptions() {
        // Create detailed descriptions for 3D elements
        const sceneDescription = document.createElement('div');
        sceneDescription.className = 'sr-only';
        sceneDescription.innerHTML = `
            <h2>3D Laptop Scene Description</h2>
            <p>This page features an interactive 3D laptop model that disassembles as you scroll. 
               The laptop consists of several clickable parts:</p>
            <ul>
                <li>Screen - Click to view projects portfolio</li>
                <li>Keyboard - Click to learn about me</li>
                <li>Ports - Click for contact information</li>
                <li>Battery - Click to view resume</li>
            </ul>
            <p>You can also use terminal commands for navigation. Type "help" in the terminal for available commands.</p>
        `;
        
        document.body.appendChild(sceneDescription);
    }
    
    setupProgressAnnouncements() {
        // Announce progress changes
        if (window.portfolioApp && window.portfolioApp.scrollController) {
            // Monitor scroll progress changes
            let lastAnnouncedProgress = -1;
            
            setInterval(() => {
                if (window.portfolioApp.scrollController) {
                    const progress = Math.round(window.portfolioApp.scrollController.getScrollProgress() * 100);
                    
                    if (progress !== lastAnnouncedProgress && progress % 25 === 0) {
                        this.announce(`Portfolio exploration ${progress}% complete`);
                        lastAnnouncedProgress = progress;
                    }
                }
            }, 1000);
        }
    }
    
    setupNavigationAssistance() {
        // Provide navigation hints
        const navigationHelp = document.createElement('div');
        navigationHelp.className = 'sr-only';
        navigationHelp.innerHTML = `
            <div role="navigation" aria-label="Keyboard shortcuts">
                <h3>Keyboard Navigation</h3>
                <ul>
                    <li>Tab - Navigate between interactive elements</li>
                    <li>Enter/Space - Activate focused element</li>
                    <li>Escape - Exit tour mode or minimize terminal</li>
                    <li>Arrow keys - Navigate 3D scene</li>
                </ul>
            </div>
        `;
        
        document.body.appendChild(navigationHelp);
    }
    
    setupHighContrastSupport() {
        if (this.isHighContrastMode) {
            document.body.classList.add('high-contrast-mode');
            
            // Add high contrast styles
            const highContrastStyle = document.createElement('style');
            highContrastStyle.textContent = `
                .high-contrast-mode {
                    --primary-color: #ffffff;
                    --background-color: #000000;
                    --accent-color: #ffff00;
                }
                
                .high-contrast-mode #terminal-overlay {
                    background: rgba(0, 0, 0, 0.95) !important;
                    border: 2px solid #ffffff !important;
                }
                
                .high-contrast-mode .terminal-response {
                    color: #ffffff !important;
                }
                
                .high-contrast-mode .prompt {
                    color: #ffff00 !important;
                }
            `;
            document.head.appendChild(highContrastStyle);
        }
    }
    
    setupReducedMotionSupport() {
        if (this.isReducedMotionPreferred) {
            document.body.classList.add('reduced-motion');
            
            // Disable or reduce animations
            const reducedMotionStyle = document.createElement('style');
            reducedMotionStyle.textContent = `
                .reduced-motion * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
                
                .reduced-motion #main-canvas {
                    opacity: 0.5;
                }
                
                .reduced-motion .terminal-hint {
                    animation: none !important;
                }
            `;
            document.head.appendChild(reducedMotionStyle);
            
            // Inform user about reduced motion
            this.announce('Animations have been reduced based on your system preferences');
        }
    }
    
    // Public API methods
    announce(message, priority = 'polite') {
        const region = priority === 'assertive' ? this.statusRegion : this.liveRegion;
        
        if (region) {
            // Clear previous message
            region.textContent = '';
            
            // Add new message after a brief delay to ensure it's announced
            setTimeout(() => {
                region.textContent = message;
            }, 100);
            
            // Clear message after a delay to prevent accumulation
            setTimeout(() => {
                if (region.textContent === message) {
                    region.textContent = '';
                }
            }, 5000);
        }
        
        console.log(`[A11Y] ${priority.toUpperCase()}: ${message}`);
    }
    
    announceStatus(message) {
        this.announce(message, 'assertive');
    }
    
    setFocusToElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.focus();
            return true;
        }
        return false;
    }
    
    skipToContent() {
        // Skip to main content functionality
        const mainContent = document.querySelector('main, #main-content, #content');
        if (mainContent) {
            mainContent.focus();
            this.announce('Skipped to main content');
        }
    }
    
    isAccessibilityActive() {
        return this.isScreenReaderActive || this.isKeyboardNavigation || this.isReducedMotionPreferred;
    }
    
    getAccessibilityStatus() {
        return {
            screenReader: this.isScreenReaderActive,
            keyboardNavigation: this.isKeyboardNavigation,
            reducedMotion: this.isReducedMotionPreferred,
            highContrast: this.isHighContrastMode
        };
    }
    
    dispose() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleGlobalKeydown);
        document.removeEventListener('focusin', this.handleFocusIn);
        document.removeEventListener('focusout', this.handleFocusOut);
        
        // Remove live regions
        if (this.liveRegion && this.liveRegion.parentNode) {
            this.liveRegion.parentNode.removeChild(this.liveRegion);
        }
        
        if (this.statusRegion && this.statusRegion.parentNode) {
            this.statusRegion.parentNode.removeChild(this.statusRegion);
        }
        
        // Remove accessibility classes
        document.body.classList.remove('high-contrast-mode', 'reduced-motion');
    }
}
