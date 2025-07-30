// Terminal UI Controller - Handles terminal interface and commands
import { EventEmitter } from './EventEmitter.js';

export class TerminalUI extends EventEmitter {
    constructor() {
        super();
        
        // DOM elements
        this.overlay = null;
        this.output = null;
        this.input = null;
        this.cursor = null;
        this.hint = null;
        
        // State
        this.isMinimized = false;
        this.isInitialized = false;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentLine = '';
        
        // Animation
        this.typewriterDelay = 50;
        this.isTyping = false;
        
        // Commands
        this.commands = new Map();
        this.setupCommands();
    }
    
    async init() {
        try {
            console.log('💻 Initializing Terminal UI...');
            
            // Get DOM references
            this.getDOMReferences();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize cursor blinking
            this.startCursorBlink();
            
            // Setup terminal behavior
            this.setupTerminalBehavior();
            
            this.isInitialized = true;
            console.log('✅ Terminal UI initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Terminal UI:', error);
            throw error;
        }
    }
    
    getDOMReferences() {
        this.overlay = document.getElementById('terminal-overlay');
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');
        this.cursor = document.getElementById('terminal-cursor');
        this.hint = document.querySelector('.terminal-hint');
        
        if (!this.overlay || !this.output || !this.input || !this.cursor) {
            throw new Error('Required terminal elements not found');
        }
    }
    
    setupEventListeners() {
        // Input handling
        this.input.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.input.addEventListener('input', this.handleInput.bind(this));
        
        // Focus management
        this.input.addEventListener('blur', this.handleBlur.bind(this));
        this.overlay.addEventListener('click', this.focusInput.bind(this));
        
        // Prevent default context menu on terminal
        this.overlay.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    setupCommands() {
        this.commands.set('help', {
            description: 'Show available commands',
            execute: () => this.showHelpCommand()
        });
        
        this.commands.set('clear', {
            description: 'Clear terminal output',
            execute: () => this.clear()
        });
        
        this.commands.set('tour', {
            description: 'Start interactive 3D tour',
            execute: () => this.emit('command', 'tour', [])
        });
        
        this.commands.set('about', {
            description: 'Navigate to about section',
            execute: () => this.emit('command', 'about', [])
        });
        
        this.commands.set('projects', {
            description: 'View projects portfolio',
            execute: () => this.emit('command', 'projects', [])
        });
        
        this.commands.set('contact', {
            description: 'Get contact information',
            execute: () => this.emit('command', 'contact', [])
        });
        
        this.commands.set('resume', {
            description: 'Download resume',
            execute: () => this.emit('command', 'resume', [])
        });
        
        this.commands.set('theme', {
            description: 'Change terminal theme',
            execute: (args) => this.emit('command', 'theme', args)
        });
        
        this.commands.set('whoami', {
            description: 'Display user information',
            execute: () => this.showWhoAmI()
        });
        
        this.commands.set('ls', {
            description: 'List available sections',
            execute: () => this.showDirectoryListing()
        });
        
        this.commands.set('pwd', {
            description: 'Show current location',
            execute: () => this.showCurrentPath()
        });
    }
    
    setupTerminalBehavior() {
        // Auto-focus input
        this.focusInput();
        
        // Hide hint after first interaction
        this.input.addEventListener('focus', () => {
            if (this.hint) {
                this.hint.style.opacity = '0.3';
            }
        }, { once: true });
    }
    
    handleKeyDown(event) {
        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                this.processCommand();
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                this.navigateHistory(-1);
                break;
                
            case 'ArrowDown':
                event.preventDefault();
                this.navigateHistory(1);
                break;
                
            case 'Tab':
                event.preventDefault();
                this.handleTabCompletion();
                break;
                
            case 'Escape':
                event.preventDefault();
                this.minimize();
                break;
                
            case 'c':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.cancelCurrentCommand();
                }
                break;
        }
    }
    
    handleInput(event) {
        this.currentLine = event.target.value;
        this.updateCursor();
    }
    
    handleBlur() {
        // Re-focus after a short delay to maintain terminal focus
        setTimeout(() => {
            if (!document.activeElement || 
                !this.overlay.contains(document.activeElement)) {
                this.focusInput();
            }
        }, 100);
    }
    
    focusInput() {
        if (!this.isMinimized && this.input) {
            this.input.focus();
        }
    }
    
    updateCursor() {
        if (this.cursor) {
            // Position cursor after text
            const inputRect = this.input.getBoundingClientRect();
            const textWidth = this.getTextWidth(this.currentLine);
            this.cursor.style.left = `${textWidth}px`;
        }
    }
    
    getTextWidth(text) {
        // Create temporary element to measure text width
        const temp = document.createElement('span');
        temp.style.font = window.getComputedStyle(this.input).font;
        temp.style.visibility = 'hidden';
        temp.style.position = 'absolute';
        temp.textContent = text;
        document.body.appendChild(temp);
        const width = temp.offsetWidth;
        document.body.removeChild(temp);
        return width;
    }
    
    startCursorBlink() {
        if (this.cursor) {
            // CSS animation handles the blinking
            this.cursor.style.animation = 'blink 1s infinite';
        }
    }
    
    processCommand() {
        const command = this.currentLine.trim();
        
        if (!command) {
            this.addPromptLine();
            return;
        }
        
        // Add command to output
        this.addOutputLine(`visitor@portfolio:~$ ${command}`, 'terminal-command');
        
        // Add to history
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;
        
        // Parse and execute command
        const [cmd, ...args] = command.split(' ');
        this.executeCommand(cmd.toLowerCase(), args);
        
        // Clear input
        this.clearInput();
    }
    
    executeCommand(command, args) {
        const commandObj = this.commands.get(command);
        
        if (commandObj) {
            try {
                commandObj.execute(args);
            } catch (error) {
                this.showError(`Error executing command: ${error.message}`);
            }
        } else {
            // Try to emit command event for main app to handle
            this.emit('command', command, args);
        }
    }
    
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex += direction;
        this.historyIndex = Math.max(-1, Math.min(this.historyIndex, this.commandHistory.length - 1));
        
        if (this.historyIndex >= 0) {
            this.input.value = this.commandHistory[this.historyIndex];
        } else {
            this.input.value = '';
        }
        
        this.currentLine = this.input.value;
        this.updateCursor();
    }
    
    handleTabCompletion() {
        const partial = this.currentLine.toLowerCase();
        const matches = Array.from(this.commands.keys()).filter(cmd => 
            cmd.startsWith(partial)
        );
        
        if (matches.length === 1) {
            this.input.value = matches[0];
            this.currentLine = matches[0];
            this.updateCursor();
        } else if (matches.length > 1) {
            this.showResponse([
                '',
                'Available completions:',
                ...matches.map(match => `  ${match}`),
                ''
            ]);
        }
    }
    
    cancelCurrentCommand() {
        this.clearInput();
        this.addOutputLine('^C', 'terminal-error');
        this.addPromptLine();
    }
    
    clearInput() {
        this.input.value = '';
        this.currentLine = '';
        this.updateCursor();
        this.addPromptLine();
    }
    
    addPromptLine() {
        setTimeout(() => {
            this.focusInput();
        }, 50);
    }
    
    addOutputLine(text, className = 'terminal-response') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.textContent = text;
        this.output.appendChild(line);
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }
    
    async showWelcomeMessage() {
        const welcomeLines = [
            '',
            '╔══════════════════════════════════════════╗',
            '║         PORTFOLIO TERMINAL v2.0          ║',
            '║              Abhay Bhingradia             ║',
            '╚══════════════════════════════════════════╝',
            '',
            'Welcome to my interactive 3D portfolio!',
            '',
            'Available commands:',
            '  help      - Show all commands',
            '  tour      - Start 3D interactive tour',
            '  about     - Learn about me',
            '  projects  - View my work',
            '  contact   - Get in touch',
            '  resume    - Download resume',
            '',
            'TIP: Scroll to disassemble the laptop or click on 3D parts!',
            ''
        ];
        
        await this.typewriterEffect(welcomeLines);
    }
    
    async typewriterEffect(lines) {
        this.isTyping = true;
        
        for (const line of lines) {
            await this.typeLine(line);
            await this.sleep(100);
        }
        
        this.isTyping = false;
    }
    
    async typeLine(text) {
        const line = document.createElement('div');
        line.className = 'terminal-line terminal-response';
        this.output.appendChild(line);
        
        for (let i = 0; i <= text.length; i++) {
            line.textContent = text.substring(0, i);
            this.scrollToBottom();
            await this.sleep(this.typewriterDelay);
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showResponse(lines) {
        if (Array.isArray(lines)) {
            lines.forEach(line => this.addOutputLine(line));
        } else {
            this.addOutputLine(lines);
        }
    }
    
    showError(message) {
        this.addOutputLine(message, 'terminal-error');
    }
    
    showHelpCommand() {
        const helpLines = [
            '',
            '=== AVAILABLE COMMANDS ===',
            ''
        ];
        
        this.commands.forEach((cmd, name) => {
            helpLines.push(`  ${name.padEnd(12)} - ${cmd.description}`);
        });
        
        helpLines.push('');
        this.showResponse(helpLines);
    }
    
    showWhoAmI() {
        const whoAmILines = [
            '',
            '👤 USER INFO',
            '',
            '  Name: Abhay Bhingradia',
            '  Role: Web Developer',
            '  Location: Portfolio Terminal',
            '  Status: Online',
            '  Skills: JavaScript, React, Three.js, Node.js',
            ''
        ];
        
        this.showResponse(whoAmILines);
    }
    
    showDirectoryListing() {
        const lsLines = [
            '',
            'drwxr-xr-x  1 abhay  users   256 Jul 29 2025 about/',
            'drwxr-xr-x  1 abhay  users   512 Jul 29 2025 projects/',
            'drwxr-xr-x  1 abhay  users   128 Jul 29 2025 contact/',
            '-rw-r--r--  1 abhay  users  1024 Jul 29 2025 resume.pdf',
            '-rw-r--r--  1 abhay  users   256 Jul 29 2025 README.md',
            ''
        ];
        
        this.showResponse(lsLines);
    }
    
    showCurrentPath() {
        this.showResponse(['', '/home/portfolio/abhay.bhingradia.com', '']);
    }
    
    showHint(message) {
        if (this.hint) {
            this.hint.textContent = message;
            this.hint.style.opacity = '1';
        }
    }
    
    hideHint() {
        if (this.hint) {
            this.hint.style.opacity = '0.5';
            setTimeout(() => {
                if (this.hint) {
                    this.hint.textContent = 'Type "help" to begin your journey';
                }
            }, 1000);
        }
    }
    
    clear() {
        if (this.output) {
            this.output.innerHTML = '';
        }
    }
    
    minimize() {
        this.isMinimized = true;
        this.overlay.style.opacity = '0.1';
        this.overlay.style.pointerEvents = 'none';
        
        // Show restore hint
        setTimeout(() => {
            if (this.isMinimized) {
                this.showRestoreHint();
            }
        }, 2000);
    }
    
    restore() {
        this.isMinimized = false;
        this.overlay.style.opacity = '1';
        this.overlay.style.pointerEvents = 'auto';
        this.focusInput();
        this.hideRestoreHint();
    }
    
    showRestoreHint() {
        const restoreHint = document.createElement('div');
        restoreHint.id = 'restore-hint';
        restoreHint.textContent = 'Press any key to restore terminal';
        restoreHint.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            color: #00ff41;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            opacity: 0.7;
            z-index: 1000;
            animation: pulse 2s infinite;
        `;
        
        document.body.appendChild(restoreHint);
        
        // Listen for any key to restore
        const restoreHandler = (event) => {
            if (this.isMinimized) {
                this.restore();
                document.removeEventListener('keydown', restoreHandler);
            }
        };
        
        document.addEventListener('keydown', restoreHandler);
    }
    
    hideRestoreHint() {
        const restoreHint = document.getElementById('restore-hint');
        if (restoreHint) {
            restoreHint.remove();
        }
    }
    
    handleResize() {
        // Adjust terminal layout for different screen sizes
        if (window.innerWidth <= 768) {
            this.overlay.style.fontSize = '12px';
        } else {
            this.overlay.style.fontSize = '14px';
        }
    }
    
    dispose() {
        // Clean up event listeners and DOM references
        if (this.input) {
            this.input.removeEventListener('keydown', this.handleKeyDown);
            this.input.removeEventListener('input', this.handleInput);
            this.input.removeEventListener('blur', this.handleBlur);
        }
        
        if (this.overlay) {
            this.overlay.removeEventListener('click', this.focusInput);
            this.overlay.removeEventListener('contextmenu', (e) => e.preventDefault());
        }
        
        this.hideRestoreHint();
    }
}
