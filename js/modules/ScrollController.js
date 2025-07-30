// Scroll Controller - Manages scroll-synced animations
export class ScrollController {
    constructor(sceneManager, terminalUI) {
        this.sceneManager = sceneManager;
        this.terminalUI = terminalUI;
        
        // Scroll state
        this.lastScrollY = 0;
        this.scrollProgress = 0;
        this.isScrolling = false;
        this.scrollTimeout = null;
        
        // Animation phases
        this.phases = {
            IDLE: 0,
            OPENING: 1,
            DISASSEMBLING: 2,
            COMPLETE: 3
        };
        this.currentPhase = this.phases.IDLE;
        
        // Intersection Observer for sections
        this.observer = null;
        this.sections = new Map();
        
        this.init();
    }
    
    init() {
        console.log('📜 Initializing Scroll Controller...');
        
        // Setup scroll listeners
        this.setupScrollListeners();
        
        // Setup intersection observer
        this.setupIntersectionObserver();
        
        // Create virtual sections for scroll tracking
        this.createVirtualSections();
        
        console.log('✅ Scroll Controller initialized');
    }
    
    setupScrollListeners() {
        // Mouse wheel
        window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        
        // Touch events for mobile
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        
        // Keyboard navigation
        window.addEventListener('keydown', this.handleKeyboard.bind(this));
        
        // Prevent default scrolling on body
        document.body.style.overflow = 'hidden';
    }
    
    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: [0, 0.25, 0.5, 0.75, 1]
        };
        
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            observerOptions
        );
    }
    
    createVirtualSections() {
        // Create invisible sections to track scroll progress
        const sectionData = [
            { name: 'hero', start: 0, end: 0.2 },
            { name: 'opening', start: 0.2, end: 0.4 },
            { name: 'disassembly', start: 0.4, end: 0.8 },
            { name: 'navigation', start: 0.8, end: 1.0 }
        ];
        
        sectionData.forEach(section => {
            this.sections.set(section.name, {
                ...section,
                isActive: false,
                element: this.createSectionElement(section.name)
            });
        });
    }
    
    createSectionElement(name) {
        const element = document.createElement('div');
        element.id = `section-${name}`;
        element.className = 'virtual-section';
        element.style.cssText = `
            position: fixed;
            top: ${this.sections.size * 100}vh;
            left: 0;
            width: 100%;
            height: 100vh;
            pointer-events: none;
            z-index: -1;
        `;
        
        document.body.appendChild(element);
        this.observer.observe(element);
        
        return element;
    }
    
    handleWheel(event) {
        event.preventDefault();
        
        const delta = event.deltaY > 0 ? 1 : -1;
        this.updateScrollProgress(delta * 0.02);
        
        this.handleScrollEvent();
    }
    
    handleTouchStart(event) {
        this.touchStartY = event.touches[0].clientY;
        this.isScrolling = false;
    }
    
    handleTouchMove(event) {
        if (!this.touchStartY) return;
        
        const touchY = event.touches[0].clientY;
        const deltaY = this.touchStartY - touchY;
        const delta = deltaY > 0 ? 1 : -1;
        
        // Prevent default scrolling
        if (Math.abs(deltaY) > 10) {
            event.preventDefault();
            this.updateScrollProgress(delta * 0.01);
            this.handleScrollEvent();
        }
    }
    
    handleTouchEnd() {
        this.touchStartY = null;
    }
    
    handleKeyboard(event) {
        switch (event.key) {
            case 'ArrowDown':
            case 'PageDown':
            case ' ': // Space
                event.preventDefault();
                this.updateScrollProgress(0.1);
                this.handleScrollEvent();
                break;
                
            case 'ArrowUp':
            case 'PageUp':
                event.preventDefault();
                this.updateScrollProgress(-0.1);
                this.handleScrollEvent();
                break;
                
            case 'Home':
                event.preventDefault();
                this.setScrollProgress(0);
                this.handleScrollEvent();
                break;
                
            case 'End':
                event.preventDefault();
                this.setScrollProgress(1);
                this.handleScrollEvent();
                break;
        }
    }
    
    updateScrollProgress(delta) {
        this.scrollProgress = Math.max(0, Math.min(1, this.scrollProgress + delta));
        this.sceneManager.updateScrollProgress(this.scrollProgress);
        this.updatePhase();
    }
    
    setScrollProgress(value) {
        this.scrollProgress = Math.max(0, Math.min(1, value));
        this.sceneManager.updateScrollProgress(this.scrollProgress);
        this.updatePhase();
    }
    
    updatePhase() {
        const newPhase = this.getPhaseFromProgress(this.scrollProgress);
        
        if (newPhase !== this.currentPhase) {
            this.onPhaseChange(this.currentPhase, newPhase);
            this.currentPhase = newPhase;
        }
    }
    
    getPhaseFromProgress(progress) {
        if (progress < 0.1) return this.phases.IDLE;
        if (progress < 0.3) return this.phases.OPENING;
        if (progress < 0.9) return this.phases.DISASSEMBLING;
        return this.phases.COMPLETE;
    }
    
    onPhaseChange(oldPhase, newPhase) {
        console.log(`Phase change: ${oldPhase} → ${newPhase}`);
        
        switch (newPhase) {
            case this.phases.OPENING:
                this.handleOpeningPhase();
                break;
                
            case this.phases.DISASSEMBLING:
                this.handleDisassemblyPhase();
                break;
                
            case this.phases.COMPLETE:
                this.handleCompletePhase();
                break;
                
            case this.phases.IDLE:
                this.handleIdlePhase();
                break;
        }
        
        // Update terminal hint based on phase
        this.updateTerminalHint(newPhase);
    }
    
    handleOpeningPhase() {
        // Trigger laptop opening animation
        this.terminalUI.showHint('Laptop is opening...');
        
        // You can add specific opening animations here
        // For example, animate the laptop hinge
    }
    
    handleDisassemblyPhase() {
        this.terminalUI.showHint('Parts are disassembling... Click on them to explore!');
        
        // Enable part interactions
        this.sceneManager.laptopParts.forEach((part, name) => {
            part.userData.clickable = true;
        });
    }
    
    handleCompletePhase() {
        this.terminalUI.showHint('Disassembly complete! Use terminal commands to navigate.');
        
        // Show navigation options
        this.showNavigationOptions();
    }
    
    handleIdlePhase() {
        this.terminalUI.showHint('Scroll down to begin the journey...');
    }
    
    showNavigationOptions() {
        const navigationMessage = [
            '',
            '🎯 NAVIGATION OPTIONS',
            '',
            '• Click on laptop parts to explore sections',
            '• Type commands in the terminal',
            '• Use keyboard arrows to navigate',
            ''
        ];
        
        setTimeout(() => {
            this.terminalUI.showResponse(navigationMessage);
        }, 1000);
    }
    
    updateTerminalHint(phase) {
        const hints = {
            [this.phases.IDLE]: 'Scroll down to begin your journey',
            [this.phases.OPENING]: 'The laptop is opening...',
            [this.phases.DISASSEMBLING]: 'Click on parts or continue scrolling',
            [this.phases.COMPLETE]: 'Ready for exploration!'
        };
        
        const hint = hints[phase];
        if (hint) {
            this.terminalUI.showHint(hint);
        }
    }
    
    handleScrollEvent() {
        this.isScrolling = true;
        
        // Clear existing timeout
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        // Set timeout to detect scroll end
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
            this.onScrollEnd();
        }, 150);
    }
    
    onScrollEnd() {
        console.log(`Scroll ended at progress: ${this.scrollProgress.toFixed(2)}`);
        
        // Snap to phase boundaries if close
        this.snapToPhase();
        
        // Update any UI elements that depend on scroll state
        this.updateScrollDependentUI();
    }
    
    snapToPhase() {
        const snapThreshold = 0.05;
        const phaseProgresses = [0, 0.25, 0.65, 1];
        
        for (const phaseProgress of phaseProgresses) {
            if (Math.abs(this.scrollProgress - phaseProgress) < snapThreshold) {
                this.setScrollProgress(phaseProgress);
                break;
            }
        }
    }
    
    updateScrollDependentUI() {
        // Update progress indicator
        const progressPercent = Math.round(this.scrollProgress * 100);
        
        // Update document title to reflect progress
        if (progressPercent === 0) {
            document.title = 'Abhay Bhingradia - Interactive Portfolio';
        } else if (progressPercent < 30) {
            document.title = 'Opening Laptop... - Abhay Bhingradia';
        } else if (progressPercent < 90) {
            document.title = 'Exploring Components... - Abhay Bhingradia';
        } else {
            document.title = 'Ready to Navigate - Abhay Bhingradia';
        }
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            const sectionName = entry.target.id.replace('section-', '');
            const section = this.sections.get(sectionName);
            
            if (section) {
                section.isActive = entry.isIntersecting;
                
                if (entry.isIntersecting) {
                    console.log(`Section ${sectionName} is now visible`);
                    this.onSectionVisible(sectionName, entry.intersectionRatio);
                }
            }
        });
    }
    
    onSectionVisible(sectionName, ratio) {
        // Handle section visibility changes
        switch (sectionName) {
            case 'hero':
                this.sceneManager.setVisibility(true);
                break;
                
            case 'opening':
                // Trigger opening animations
                break;
                
            case 'disassembly':
                // Enable disassembly interactions
                break;
                
            case 'navigation':
                // Show navigation help
                break;
        }
    }
    
    // Public API methods
    scrollToPhase(phase) {
        const progressMap = {
            [this.phases.IDLE]: 0,
            [this.phases.OPENING]: 0.25,
            [this.phases.DISASSEMBLING]: 0.65,
            [this.phases.COMPLETE]: 1
        };
        
        const targetProgress = progressMap[phase];
        if (targetProgress !== undefined) {
            this.animateToProgress(targetProgress);
        }
    }
    
    async animateToProgress(targetProgress, duration = 1000) {
        const startProgress = this.scrollProgress;
        const startTime = performance.now();
        
        return new Promise(resolve => {
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out-cubic)
                const eased = 1 - Math.pow(1 - progress, 3);
                
                const currentProgress = startProgress + (targetProgress - startProgress) * eased;
                this.setScrollProgress(currentProgress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }
    
    getCurrentPhase() {
        return this.currentPhase;
    }
    
    getScrollProgress() {
        return this.scrollProgress;
    }
    
    // Navigation methods
    scrollToNext() {
        const nextPhase = Math.min(this.currentPhase + 1, this.phases.COMPLETE);
        this.scrollToPhase(nextPhase);
    }
    
    scrollToPrevious() {
        const prevPhase = Math.max(this.currentPhase - 1, this.phases.IDLE);
        this.scrollToPhase(prevPhase);
    }
    
    dispose() {
        // Remove event listeners
        window.removeEventListener('wheel', this.handleWheel);
        window.removeEventListener('touchstart', this.handleTouchStart);
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);
        window.removeEventListener('keydown', this.handleKeyboard);
        
        // Disconnect intersection observer
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Remove virtual sections
        this.sections.forEach(section => {
            if (section.element && section.element.parentNode) {
                section.element.parentNode.removeChild(section.element);
            }
        });
        
        // Clear timeouts
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        // Restore body overflow
        document.body.style.overflow = '';
    }
}
