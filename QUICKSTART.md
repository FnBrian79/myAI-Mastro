# Quick Deployment Guide

Get your myAI Maestro application deployed in under 5 minutes!

## 🚀 Fastest Path to Production

### Prerequisites
- GitHub account
- Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### Deploy to Vercel (Recommended - ~2 minutes)

1. **Go to [Vercel](https://vercel.com/new)**

2. **Import your repository**
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure the project**
   - Framework Preset: **Vite** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `dist` (auto-filled)

4. **Add environment variable**
   - Click "Environment Variables"
   - Name: `GEMINI_API_KEY`
   - Value: `your-api-key-here`
   - Click "Add"

5. **Deploy!**
   - Click "Deploy"
   - Wait ~30 seconds
   - Your app is live! 🎉

6. **Get your URL**
   - Copy the deployment URL (e.g., `myai-maestro.vercel.app`)
   - Share with your team!

### Deploy to Netlify (~2 minutes)

1. **Go to [Netlify](https://app.netlify.com/start)**

2. **Connect to Git**
   - Click "Import from Git"
   - Choose GitHub
   - Select your repository

3. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Show advanced" → "New variable"
     - Key: `GEMINI_API_KEY`
     - Value: `your-api-key-here`

4. **Deploy site**
   - Click "Deploy site"
   - Wait ~30 seconds
   - Your app is live! 🎉

5. **Get your URL**
   - Copy the Netlify URL (e.g., `myai-maestro.netlify.app`)

## 📦 One-Command Deployments

### Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Add environment variable when prompted
# Or add via dashboard after deployment
```

### Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Add environment variable
netlify env:set GEMINI_API_KEY your-api-key-here
```

## 🐳 Docker Deployment (~3 minutes)

If you have Docker installed:

```bash
# Build the image
docker build -t myai-maestro .

# Run the container
docker run -p 3000:3000 -e GEMINI_API_KEY=your-api-key-here myai-maestro

# Or use docker-compose
echo "GEMINI_API_KEY=your-api-key-here" > .env
docker-compose up
```

Access at http://localhost:3000

## ✅ Post-Deployment Checklist

After deployment, verify:

1. **Application loads** ✓
2. **No console errors** ✓
3. **Contract builder works** ✓
4. **Gemini API responds** ✓
5. **All views are accessible** ✓

## 🔧 Common Issues

### "Build failed"
- Check that `GEMINI_API_KEY` is set
- Verify Node.js version is 18+
- Check build logs for errors

### "API key invalid"
- Verify API key at https://aistudio.google.com
- Ensure no extra spaces in the key
- Check environment variable name is exact: `GEMINI_API_KEY`

### "Can't connect to API"
- Check API key permissions
- Verify network isn't blocking requests
- Check browser console for errors

## 📞 Need Help?

1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions
2. Review [SECURITY.md](SECURITY.md) for security best practices
3. See [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for full checklist
4. Open an issue on GitHub

## 🎯 Next Steps

After deployment:

- [ ] Set up custom domain
- [ ] Configure monitoring
- [ ] Review [SECURITY.md](SECURITY.md)
- [ ] Share with your team
- [ ] Star the repo ⭐

---

**Deployment Time:** ~2-5 minutes  
**Difficulty:** Easy 🟢  
**Cost:** Free tier available on all platforms
