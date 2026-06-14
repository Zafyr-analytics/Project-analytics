# Zafyr Analytics — Data Consultant FP&A

Portfolio & website for data consultant specializing in FP&A (Financial Planning & Analysis).

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: CSS-in-JS with CSS variables
- **Design**: Dark/Light theme toggle, 3D animations, responsive layout
- **Hosting**: Vercel

## Features

- Multi-page routing (Home, Expertise, Services, Portfolio, About, Contact)
- Dark & Light theme with smooth transitions
- 3D scroll reveals and card animations
- Service detail pages with FAQ
- Contact form (requires Formspree or Netlify Forms integration)
- Mobile-first responsive design

## Local Development

### Prerequisites
- Node.js 16+ and npm

### Setup

```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project" → Select your GitHub repo
4. Vercel auto-detects Vite config
5. Click "Deploy"
6. Your site is live in 60 seconds

### Environment Variables (Optional)

If using Formspree for contact form:
- Add your Formspree URL in the contact form handler

## Project Structure

```
.
├── index.html          # HTML entry point
├── package.json        # Dependencies
├── vite.config.js      # Vite config
├── .gitignore
└── src/
    ├── main.jsx        # React mount point
    └── App.jsx         # Main app component (all-in-one)
```

## Notes

- All styling is contained in `App.jsx` using CSS-in-JS
- The site uses client-side routing with React hooks (no Next.js)
- Images and assets can be added to `public/` folder
- Contact form needs to be wired to Formspree, Netlify Forms, or your backend

## Next Steps

1. Update contact form to receive submissions (Formspree or Netlify Forms)
2. Add your GitHub and LinkedIn links in footer
3. Deploy portfolio projects (3 datasets)
4. Update portfolio section with real project links

---

**Created with React, Vite, and 3D CSS animations.**
