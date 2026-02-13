# How to Run Ark Grid Solver

## Method 1: Using npm (Recommended)

```bash
cd /Users/shizukaziye/Coding/ark-grid-solver
npm start
```

This will:
- Start a local web server on port 8080
- Automatically open your browser
- If it doesn't open automatically, go to: http://localhost:8080

## Method 2: Using Python

```bash
cd /Users/shizukaziye/Coding/ark-grid-solver
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.

## Method 3: Direct File Access

Simply double-click `index.html` to open it in your browser.

**Note:** Some features may be limited with direct file access due to browser security restrictions.

## Troubleshooting

### Page doesn't load
- Make sure you're accessing http://localhost:8080 (not file://)
- Check if port 8080 is already in use
- Try a different port: `npx http-server . -p 3000`

### JavaScript errors
- Open browser console (F12 or Cmd+Option+I)
- Look for red error messages
- Make sure all files (solver.js, app.js, styles.css) are in the same folder

### Buttons don't work
- Check browser console for errors
- Make sure JavaScript is enabled in your browser
- Try refreshing the page (Ctrl+R or Cmd+R)

## Quick Test

1. Open http://localhost:8080
2. You should see "Ark Grid Solver" title
3. Try clicking "Calculate Score" button
4. If nothing happens, check browser console for errors
