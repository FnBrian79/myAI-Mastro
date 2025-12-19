<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# myAI Maestro

**A sophisticated dashboard for the Governed Orchestrated Thought Machine Engine (GOTME)**

[![Deployment Ready](https://img.shields.io/badge/deployment-ready-brightgreen)]()
[![Vite](https://img.shields.io/badge/vite-6.2.0-646CFF?logo=vite)]()
[![React](https://img.shields.io/badge/react-19.2.3-61DAFB?logo=react)]()
[![TypeScript](https://img.shields.io/badge/typescript-5.8.2-3178C6?logo=typescript)]()

> Enables parallel AI consultations, iterative evolution, and character-count convergence monitoring.

View your app in AI Studio: https://ai.studio/apps/drive/1voZUS5a0JfkzfpPlLjbsj_pAdJhGstzv

## ✨ Features

- 🤖 **Multi-Model Orchestration** - Coordinate responses from multiple AI models
- 📊 **Real-time Convergence Tracking** - Monitor consensus building across AI partners
- 🔄 **Iterative Refinement** - Evolve responses through multiple rounds
- 📈 **Governance Dashboard** - Track model performance and decision metrics
- 🎯 **Contract-Based Sessions** - Define research objectives and success criteria
- 💬 **Interactive ChatBot** - Direct communication with AI advisors
- 🔗 **Service Integration** - Connect with Pieces and Ollama for enhanced capabilities

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- **Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

### Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/FnBrian79/myAI-Mastro.git
   cd myAI-Mastro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
4. **Add your Gemini API key** to `.env.local`:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

Build the optimized production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## 🌐 Deploy to Production

This application is ready to deploy to various platforms. See the comprehensive [Deployment Guide](DEPLOYMENT.md) for detailed instructions.

### Quick Deploy Options:

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

For complete deployment instructions including Docker, GitHub Pages, and traditional hosting, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 📁 Project Structure

```
myAI-Mastro/
├── components/          # React components
│   ├── Layout.tsx
│   ├── ContractBuilder.tsx
│   ├── OrchestrationView.tsx
│   ├── GovernanceView.tsx
│   ├── LineageView.tsx
│   ├── AutomationView.tsx
│   └── ChatBot.tsx
├── services/           # API service integrations
│   ├── gemini.ts      # Google Gemini AI service
│   ├── ollama.ts      # Ollama integration
│   └── pieces.ts      # Pieces integration
├── App.tsx            # Main application component
├── constants.tsx      # Application constants
├── types.ts           # TypeScript type definitions
└── vite.config.ts     # Vite configuration

```

## 🔧 Configuration

### Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key (required)

### Vite Configuration

The application uses Vite for fast development and optimized production builds. Configuration is in `vite.config.ts`.

## 🛠️ Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🔒 Security

- Never commit `.env.local` files with real API keys
- Use environment variables for all sensitive configuration
- The `.gitignore` file is configured to exclude sensitive files
- See [DEPLOYMENT.md](DEPLOYMENT.md) for security best practices

## 📝 License

[Add your license information]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
- Check the [Deployment Guide](DEPLOYMENT.md)
- Open an issue on GitHub
- Contact the maintainers

---

Built with ❤️ using React, TypeScript, and Vite
