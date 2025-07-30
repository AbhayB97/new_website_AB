# Abhay Bhingradia - Interactive 3D Portfolio

A cutting-edge, interactive 3D portfolio website featuring terminal-style navigation, scroll-synced animations, and immersive 3D experiences.

## 🚀 Live Demo
Visit the interactive portfolio: [abhay.bhingradia.com](https://abhay.bhingradia.com)

## ✨ Features

### 🎯 Core Functionality
- **3D Laptop Model** - Interactive laptop that disassembles as you scroll
- **Terminal Interface** - Retro terminal UI with command-based navigation
- **Scroll-Synced Animations** - Smooth animations triggered by scroll progress
- **Click Interactions** - Click on laptop parts to navigate to different sections
- **Tour Mode** - Guided 3D exploration with pointer lock

### 🎨 Visual Design
- **Matrix-inspired Theme** - Dark background with neon green accents
- **ASCII Art Logo** - Custom terminal banner with ASCII graphics
- **Particle Effects** - Ambient background particles and grid
- **Smooth Animations** - Powered by Anime.js for fluid motion
- **Progress Indicator** - Visual progress bar showing disassembly state

### 📱 Responsive & Accessible
- **Mobile-First Design** - Optimized for all screen sizes
- **Touch Gestures** - Swipe navigation for mobile devices
- **Keyboard Navigation** - Full keyboard accessibility support
- **Screen Reader Support** - ARIA labels and live regions
- **Progressive Enhancement** - Fallback navigation if JS fails
- **Reduced Motion** - Respects user accessibility preferences

### 🛠️ Technical Features
- **ES6 Modules** - Modern JavaScript architecture
- **Three.js Integration** - WebGL 3D graphics
- **Vite Build System** - Fast development and optimized builds
- **Performance Optimized** - Lazy loading and efficient rendering
- **SEO Friendly** - Proper meta tags and JSON-LD schema

## 🏗️ Project Structure

```
new_website_AB/
├── index.html              # Main HTML file
├── package.json             # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── css/
│   └── style.css           # Main stylesheet
├── js/
│   ├── main.js             # Application entry point
│   └── modules/
│       ├── SceneManager.js        # 3D scene management
│       ├── TerminalUI.js          # Terminal interface
│       ├── ScrollController.js    # Scroll-based interactions
│       ├── MobileController.js    # Mobile-specific features
│       ├── AccessibilityManager.js # A11y features
│       └── EventEmitter.js        # Event system
└── public/
    └── models/             # 3D model assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AbhayB97/new_website_AB.git
cd new_website_AB
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:3000`

### Build for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

## 🎮 User Guide

### Terminal Commands
- `help` - Show all available commands
- `tour` - Start interactive 3D tour mode
- `about` - Navigate to about section
- `projects` - View projects portfolio
- `contact` - Get contact information
- `resume` - Download resume
- `clear` - Clear terminal output
- `whoami` - Display user information
- `ls` - List available sections

### Navigation Methods
1. **Terminal Commands** - Type commands in the terminal
2. **Scroll Navigation** - Scroll to trigger laptop disassembly
3. **Click Interactions** - Click on 3D laptop parts
4. **Keyboard Navigation** - Use arrow keys and tab for accessibility
5. **Mobile Gestures** - Swipe up/down on mobile devices

### Keyboard Shortcuts
- `Tab` - Navigate between interactive elements
- `Enter/Space` - Activate focused element
- `Escape` - Exit tour mode or minimize terminal
- `Arrow Keys` - Navigate 3D scene
- `Ctrl+C` - Cancel current terminal command

## 🛠️ Technology Stack

### Frontend
- **Three.js** - 3D graphics and WebGL rendering
- **Anime.js** - Animation library for smooth transitions
- **Vanilla JavaScript** - ES6+ modules, no framework dependencies
- **CSS3** - Modern styling with flexbox and grid
- **HTML5** - Semantic markup with accessibility features

### Build Tools
- **Vite** - Fast build tool and development server
- **ES6 Modules** - Native module system
- **Terser** - JavaScript minification
- **PostCSS** - CSS processing (if needed)

### Performance
- **Code Splitting** - Separate chunks for Three.js and Anime.js
- **Asset Optimization** - Compressed models and textures
- **Lazy Loading** - On-demand resource loading
- **Intersection Observer** - Efficient scroll detection

## 🎯 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Required Features
- WebGL support
- ES6 modules
- Intersection Observer API
- Pointer Lock API (for tour mode)

## 📱 Mobile Features

### Touch Interactions
- **Swipe Navigation** - Swipe up/down to navigate sections
- **Touch Feedback** - Visual feedback for touch interactions
- **Gesture Recognition** - Multi-touch gesture support
- **Orientation Support** - Landscape and portrait modes

### Mobile Optimizations
- **Reduced Animations** - Lighter animations for performance
- **Touch-Friendly UI** - Larger touch targets
- **Hamburger Menu** - Fallback navigation menu
- **Responsive Typography** - Scalable text sizes

## ♿ Accessibility Features

### Screen Reader Support
- ARIA live regions for dynamic content
- Semantic HTML structure
- Alternative descriptions for 3D content
- Keyboard navigation announcements

### Visual Accessibility
- High contrast mode support
- Focus indicators for keyboard navigation
- Reduced motion preferences
- Scalable interface elements

### Motor Accessibility
- Keyboard-only navigation
- Large touch targets on mobile
- No time-based interactions
- Alternative input methods

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### GitHub Pages
```bash
npm run build
# Deploy dist/ folder to gh-pages branch
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

## 🔧 Configuration

### Vite Configuration
Edit `vite.config.js` to customize:
- Build output directory
- Asset handling
- Plugin configuration
- Development server settings

### Environment Variables
Create `.env` file for:
```
VITE_API_URL=your_api_url
VITE_ANALYTICS_ID=your_analytics_id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ES6+ standards
- Add comments for complex functions
- Test on multiple devices and browsers
- Ensure accessibility compliance
- Maintain performance standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Abhay Bhingradia**
- Website: [abhay.bhingradia.com](https://abhay.bhingradia.com)
- Email: [contact@example.com]
- LinkedIn: [Your LinkedIn Profile]
- GitHub: [@AbhayB97](https://github.com/AbhayB97)

## 🙏 Acknowledgments

- Three.js community for 3D graphics capabilities
- Anime.js for smooth animation library
- Matrix movies for terminal inspiration
- Web accessibility guidelines (WCAG 2.1)

---

*Built with ❤️ and modern web technologies*
