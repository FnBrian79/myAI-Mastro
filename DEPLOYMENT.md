# Deployment Guide

This guide provides comprehensive instructions for deploying the myAI Maestro application to production.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Gemini API key (get one at https://aistudio.google.com/app/apikey)
- Git installed

## Environment Configuration

1. **Create environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Add your Gemini API key:**
   Edit `.env.local` and replace `your_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=your_actual_api_key
   ```

⚠️ **Security Warning:** Never commit `.env.local` or `.env` files containing real API keys to version control!

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```
   The app will be available at http://localhost:3000

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the recommended platform for deploying this Vite + React application.

#### Deploy via Vercel CLI:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set environment variable:**
   After deployment, add your API key in the Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `GEMINI_API_KEY` with your API key value
   - Redeploy the application

#### Deploy via Vercel Dashboard:

1. Go to https://vercel.com
2. Click "Import Project"
3. Import your GitHub repository
4. Vercel will auto-detect the Vite framework
5. Add `GEMINI_API_KEY` environment variable
6. Click "Deploy"

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

4. **Set environment variable:**
   - Go to Netlify dashboard
   - Navigate to Site settings > Environment variables
   - Add `GEMINI_API_KEY` with your API key

#### Deploy via Netlify Dashboard:

1. Go to https://app.netlify.com
2. Click "Add new site" > "Import an existing project"
3. Connect to your Git provider
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add `GEMINI_API_KEY` environment variable
6. Click "Deploy site"

### Option 3: GitHub Pages

GitHub Pages is suitable for static sites but requires additional setup for environment variables.

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts:**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Update vite.config.ts** to set the base path:
   ```typescript
   export default defineConfig({
     base: '/myAI-Mastro/', // Your repo name
     // ... other config
   })
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

⚠️ **Note:** GitHub Pages doesn't support environment variables server-side. You'll need to handle API keys differently (not recommended for production).

### Option 4: Docker Deployment

1. **Create a Dockerfile:**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   RUN npm install -g serve
   EXPOSE 3000
   CMD ["serve", "-s", "dist", "-l", "3000"]
   ```

2. **Build and run:**
   ```bash
   docker build -t myai-maestro .
   docker run -p 3000:3000 -e GEMINI_API_KEY=your_key myai-maestro
   ```

### Option 5: Traditional Web Hosting

For traditional hosting (Apache, Nginx, etc.):

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your web server

3. **Configure web server** to serve `index.html` for all routes (SPA routing)

   **Nginx example:**
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

   **Apache example (.htaccess):**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

## Post-Deployment Checklist

- [ ] Verify the application loads correctly
- [ ] Test the Gemini API integration works
- [ ] Check console for any errors
- [ ] Verify all routes work properly (SPA routing)
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Verify environment variables are properly set
- [ ] Check that API keys are not exposed in client code
- [ ] Set up monitoring/error tracking (optional)
- [ ] Configure custom domain (optional)

## Security Best Practices

1. **API Key Protection:**
   - Never commit API keys to version control
   - Use environment variables for sensitive data
   - Rotate API keys regularly
   - Monitor API usage for anomalies

2. **HTTPS:**
   - Always use HTTPS in production
   - Most platforms (Vercel, Netlify) provide HTTPS automatically

3. **Content Security Policy:**
   - Consider adding CSP headers for additional security

4. **Rate Limiting:**
   - Be aware of Gemini API rate limits
   - Implement client-side rate limiting if needed

## Troubleshooting

### Build Fails

- Check Node.js version (requires 18+)
- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

### API Key Not Working

- Verify the environment variable name matches: `GEMINI_API_KEY`
- Check that the API key is valid at https://aistudio.google.com
- Ensure environment variables are set in the deployment platform
- Redeploy after adding environment variables

### SPA Routing Issues

- Ensure your web server is configured to serve `index.html` for all routes
- Check `vercel.json` or `netlify.toml` configuration

### CORS Errors

- Gemini API should be called from the client-side
- Ensure API calls are properly configured in `services/gemini.ts`

## Monitoring and Maintenance

1. **Logs:** Check platform logs (Vercel, Netlify) for errors
2. **API Usage:** Monitor Gemini API quota at https://aistudio.google.com
3. **Updates:** Keep dependencies updated with `npm update`
4. **Security:** Run `npm audit` regularly

## Support

For issues:
1. Check the GitHub repository issues
2. Review the README.md
3. Contact the repository maintainer

## License

[Your license information]
