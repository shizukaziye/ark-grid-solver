# Setting Up Git for Cross-Platform Development

Follow these steps to sync your code between your Mac and Windows PC.

## Step 1: Initialize Git Repository (Run on Mac)

Open Terminal on your Mac and run:

```bash
cd /Users/shizukaziye/Coding/ark-grid-solver
git init
git add .
git commit -m "Initial commit: Ark Grid Solver"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ark-grid-solver`
3. Choose **Public** or **Private** (your choice)
4. **DO NOT** initialize with README, .gitignore, or license (we already have files)
5. Click **Create repository**

## Step 3: Push to GitHub (Run on Mac)

After creating the repo, GitHub will show you commands. Run these in Terminal:

```bash
cd /Users/shizukaziye/Coding/ark-grid-solver
git remote add origin https://github.com/YOUR_USERNAME/ark-grid-solver.git
git branch -M main
git push -u origin main
```

(Replace `YOUR_USERNAME` with your actual GitHub username)

## Step 4: Clone on Windows PC

1. **Install Git** (if not already installed):
   - Download from: https://git-scm.com/download/win
   - Install with default settings

2. **Install Cursor** (if not already):
   - Download from: https://cursor.sh

3. **Clone the repository**:
   - Open PowerShell or Command Prompt
   - Run:
   ```bash
   cd C:\Users\YOUR_WINDOWS_USERNAME\Documents
   git clone https://github.com/YOUR_USERNAME/ark-grid-solver.git
   cd ark-grid-solver
   ```

4. **Open in Cursor**:
   - Open Cursor
   - File → Open Folder
   - Navigate to `C:\Users\YOUR_WINDOWS_USERNAME\Documents\ark-grid-solver`
   - Click "Select Folder"

## Step 5: Run the Project on Windows

In Cursor's terminal (or PowerShell), run:

```bash
cd C:\Users\YOUR_WINDOWS_USERNAME\Documents\ark-grid-solver
python -m http.server 8000
```

Then open: http://localhost:8000 in your browser

## Workflow: Syncing Changes Between Mac and Windows

### When you make changes on Mac:
```bash
cd /Users/shizukaziye/Coding/ark-grid-solver
git add .
git commit -m "Description of changes"
git push
```

### When you make changes on Windows:
```bash
cd C:\Users\YOUR_WINDOWS_USERNAME\Documents\ark-grid-solver
git add .
git commit -m "Description of changes"
git push
```

### Before starting work (always pull latest):
```bash
git pull
```

## Troubleshooting

- **"Permission denied"**: Make sure you're authenticated with GitHub:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

- **"Repository not found"**: Check that you've created the GitHub repo and the URL is correct

- **"Authentication failed"**: You may need to use a Personal Access Token instead of password:
  - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generate new token with `repo` scope
  - Use token as password when pushing
