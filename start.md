# 🚀 How to Run HealthAI on Your Computer

A simple step-by-step guide to get the project running on your PC.

---

## Step 1: Install Node.js

Node.js is required to run this project.

1. Go to: **https://nodejs.org/**
2. Click the big green button that says **"LTS"** (recommended version)
3. Download and run the installer
4. Click **Next** through all steps, then **Install**
5. Wait for installation to complete, then click **Finish**

---

## Step 2: Extract the Project

1. Find the project folder you received (it may be in a `.zip` file)
2. If it's a `.zip` file, right-click → **Extract All** → **Extract**
3. Open the extracted folder (should be named `PersonalAnomalyDetector` or similar)

---

## Step 3: Open Command Prompt

1. In the project folder, click on the **address bar** at the top (where it shows the folder path)
2. Type `cmd` and press **Enter**
3. A black Command Prompt window will open

---

## Step 4: Install Project Dependencies

In the Command Prompt window, type this command and press **Enter**:

```
npm install
```

⏳ **Wait** for it to finish (may take 1-2 minutes). You'll see a progress bar.

---

## Step 5: Start the Project

In the same Command Prompt window, type this command and press **Enter**:

```
npm run dev
```

You should see something like:

```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
```

---

## Step 6: View the Website

1. Open your web browser (Chrome, Edge, Firefox, etc.)
2. In the address bar, type: **http://localhost:5174**
3. Press **Enter**

🎉 **The HealthAI website should now be running!**

---

## How to Stop the Project

1. Go back to the Command Prompt window
2. Press **Ctrl + C** on your keyboard
3. If it asks "Terminate batch job?", type **Y** and press **Enter**

---

## How to Start Again Later

1. Open the project folder
2. Click address bar → type `cmd` → press **Enter**
3. Type `npm run dev` → press **Enter**
4. Open **http://localhost:5174** in your browser

---

## Troubleshooting

### "npm is not recognized"
→ Node.js wasn't installed properly. Go back to Step 1.

### Port 5174 is already in use
→ Close any other Command Prompt windows and try again.

### The page looks broken
→ Make sure you ran `npm install` first (Step 4).

### Can't find the project folder
→ Check your Downloads folder or where you saved the project.

---

## Need Help?

If you encounter any issues, please take a screenshot and send it to us.

---

**That's it! Enjoy using HealthAI! 🏥✨**
