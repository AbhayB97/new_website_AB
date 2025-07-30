// Main Application Entry Point
import { SceneManager } from './modules/SceneManager.js';
import { TerminalUI } from './modules/TerminalUI.js';
import { ScrollController } from './modules/ScrollController.js';
import { MobileController } from './modules/MobileController.js';
import { AccessibilityManager } from './modules/AccessibilityManager.js';

class PortfolioApp {
    constructor() {
        this.isInitialized = false;
        this.isMobile = window.innerWidth <= 768;
        
        // Core modules
        this.sceneManager = null;
        this.terminalUI = null;
        this.scrollController = null;
        this.mobileController = null;
        this.accessibilityManager = null;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Portfolio App...');
            
            // Show loading state
            document.body.classList.add('loading');
            
            // Initialize accessibility first
            this.accessibilityManager = new AccessibilityManager();
            
            // Initialize mobile controller if needed
            if (this.isMobile) {
                this.mobileController = new MobileController();
            }
            
            // Initialize terminal UI
            this.terminalUI = new TerminalUI();
            await this.terminalUI.init();
            
            // Initialize 3D scene
            this.sceneManager = new SceneManager();
            await this.sceneManager.init();
            
            // Initialize scroll controller
            this.scrollController = new ScrollController(this.sceneManager, this.terminalUI);
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Mark as initialized
            this.isInitialized = true;
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
            
            console.log('✅ Portfolio App initialized successfully');
            
            // Show welcome message
            this.terminalUI.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Failed to initialize Portfolio App:', error);
            this.handleInitializationError(error);
        }
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Visibility change (for performance optimization)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Terminal command events
        this.terminalUI.on('command', this.handleTerminalCommand.bind(this));
        
        // Scene interaction events
        this.sceneManager.on('partClick', this.handlePartClick.bind(this));
        this.sceneManager.on('partHover', this.handlePartHover.bind(this));
    }
    
    handleResize() {
        const wasLookingMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        // Handle mobile/desktop transition
        if (wasLookingMobile !== this.isMobile) {
            if (this.isMobile && !this.mobileController) {
                this.mobileController = new MobileController();
            }
        }
        
        // Update scene
        if (this.sceneManager) {
            this.sceneManager.handleResize();
        }
        
        // Update terminal
        if (this.terminalUI) {
            this.terminalUI.handleResize();
        }
    }
    
    handleKeyDown(event) {
        // ESC key - exit tour mode or close terminal
        if (event.key === 'Escape') {
            if (this.sceneManager.isTourMode) {
                this.exitTourMode();
            } else {
                this.terminalUI.minimize();
            }
        }
        
        // Tab key - accessibility navigation
        if (event.key === 'Tab') {
            this.accessibilityManager.handleTabNavigation(event);
        }
        
        // Enter key - activate focused element
        if (event.key === 'Enter' && event.target !== this.terminalUI.input) {
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.classList.contains('clickable-part')) {
                focusedElement.click();
            }
        }
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations when tab is not visible
            if (this.sceneManager) {
                this.sceneManager.pause();
            }
        } else {
            // Resume animations when tab becomes visible
            if (this.sceneManager) {
                this.sceneManager.resume();
            }
        }
    }
    
    handleTerminalCommand(command, args) {
        switch (command) {
            case 'help':
                this.showHelp();
                break;
                
            case 'tour':
                this.startTourMode();
                break;
                
            case 'about':
                this.navigateToSection('about');
                break;
                
            case 'projects':
                this.navigateToSection('projects');
                break;
                
            case 'contact':
                this.navigateToSection('contact');
                break;
                
            case 'resume':
                this.navigateToSection('resume');
                break;
                
            case 'clear':
                this.terminalUI.clear();
                break;
                
            case 'theme':
                this.toggleTheme(args[0]);
                break;
                
            default:
                this.terminalUI.showError(`Command not found: ${command}`);
                this.terminalUI.showHelp();
                break;
        }
    }
    
    handlePartClick(partName, meshObject) {
        console.log(`Clicked on: ${partName}`);
        
        // Focus camera on the part
        this.sceneManager.focusOnPart(partName);
        
        // Navigate to corresponding section
        const sectionMap = {
            'screen': 'projects',
            'keyboard': 'about',
            'ports': 'contact',
            'battery': 'resume'
        };
        
        const section = sectionMap[partName];
        if (section) {
            setTimeout(() => {
                this.navigateToSection(section);
            }, 1000); // Wait for camera animation
        }
    }
    
    handlePartHover(partName, isHovering) {
        if (isHovering) {
            this.terminalUI.showHint(`Click ${partName} to explore ${this.getSectionName(partName)}`);
        } else {
            this.terminalUI.hideHint();
        }
    }
    
    showHelp() {
        const helpText = [
            '',
            '=== PORTFOLIO NAVIGATION COMMANDS ===',
            '',
            '  help      - Show this help message',
            '  tour      - Start interactive 3D tour',
            '  about     - Navigate to about section',
            '  projects  - View my projects',
            '  contact   - Get in touch',
            '  resume    - Download resume',
            '  clear     - Clear terminal output',
            '',
            'TIP: You can also scroll or click on 3D laptop parts!',
            ''
        ];
        
        this.terminalUI.showResponse(helpText);
    }
    
    startTourMode() {
        this.sceneManager.enterTourMode();
        document.body.classList.add('terminal-tour-mode');
        
        this.terminalUI.showResponse([
            '',
            '🎯 TOUR MODE ACTIVATED',
            '',
            'Pointer locked to canvas.',
            'Click on laptop parts to explore different sections.',
            'Press ESC to exit tour mode.',
            ''
        ]);
    }
    
    exitTourMode() {
        this.sceneManager.exitTourMode();
        document.body.classList.remove('terminal-tour-mode');
        
        this.terminalUI.showResponse(['', '✅ Tour mode deactivated', '']);
    }
    
    navigateToSection(section) {
        const urls = {
            'about': '/about.html',
            'projects': '/projects.html',
            'contact': '/contact.html',
            'resume': '/resume.pdf'
        };
        
        const url = urls[section];
        if (url) {
            this.terminalUI.showResponse([
                '',
                `🚀 Navigating to ${section}...`,
                ''
            ]);
            
            setTimeout(() => {
                if (section === 'resume') {
                    window.open(url, '_blank');
                } else {
                    window.location.href = url;
                }
            }, 1000);
        }
    }
    
    getSectionName(partName) {
        const nameMap = {
            'screen': 'Projects',
            'keyboard': 'About',
            'ports': 'Contact',
            'battery': 'Resume'
        };
        
        return nameMap[partName] || partName;
    }
    
    toggleTheme(themeName) {
        // Future implementation for theme switching
        this.terminalUI.showResponse([
            '',
            `Theme switching will be available in v2.1`,
            'Current theme: Matrix Green',
            ''
        ]);
    }
    
    handleInitializationError(error) {
        // Show fallback interface
        const fallbackHtml = `
            <div class="error-fallback">
                <h1>Abhay Bhingradia - Portfolio</h1>
                <p>Something went wrong loading the 3D experience.</p>
                <nav>
                    <a href="/about.html">About</a>
                    <a href="/projects.html">Projects</a>
                    <a href="/contact.html">Contact</a>
                    <a href="/resume.pdf">Resume</a>
                </nav>
                <p>Error: ${error.message}</p>
            </div>
        `;
        
        document.body.innerHTML = fallbackHtml;
        document.body.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #0a0a0a;
            color: #00ff41;
            font-family: 'Courier New', monospace;
        `;
    }
    
    // Public API methods
    getSceneManager() {
        return this.sceneManager;
    }
    
    getTerminalUI() {
        return this.terminalUI;
    }
    
    isReady() {
        return this.isInitialized;
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

export default PortfolioApp;
