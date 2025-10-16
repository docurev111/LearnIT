# 🍒 Git Cherry-Pick Guide: Pulling Specific Files from `feature/lessons`

## 🎯 Your Situation

Your groupmate created a branch called `feature/lessons` that contains:
- ✅ New files you want: `LessonIntroScreen.tsx`, `ReadLesson.tsx`, `WatchLesson.tsx`, `lessonContent.ts`
- ⚠️ Modified files you don't want yet: Many existing files were modified

**Goal:** Get only the new files into your local workspace without merging everything into main.

---

## 📋 Quick Solution (Copy-Paste Commands)

### Option 1: Cherry-Pick Files to a Review Branch (Recommended)

```powershell
# 1. Make sure you're on main and it's up to date
cd d:\LearnIT
git checkout main
git pull origin main

# 2. Fetch the feature branch
git fetch origin feature/lessons

# 3. Create a temporary review branch
git checkout -b review-lessons-work

# 4. Copy ONLY the new files from feature/lessons
git checkout origin/feature/lessons -- LearnITapp/app/LessonIntroScreen.tsx
git checkout origin/feature/lessons -- LearnITapp/app/ReadLesson.tsx
git checkout origin/feature/lessons -- LearnITapp/app/WatchLesson.tsx
git checkout origin/feature/lessons -- LearnITapp/constants/lessonContent.ts
git checkout origin/feature/lessons -- LearnITapp/assets/images/LandingLogo2.png

# 5. Check what was added
git status

# 6. Test the changes
cd LearnITapp
npx expo start
# Test thoroughly...

# 7. If everything works, commit
git add .
git commit -m "Add new lesson screens from feature/lessons branch"

# 8. Push to a separate branch for review (NOT main yet)
git push origin review-lessons-work
```

**Result:** You now have the new files in `review-lessons-work` branch without affecting `main`.

---

### Option 2: Preview Files Without Committing (Read-Only)

```powershell
# Just view the branch without changing your workspace
git fetch origin feature/lessons
git checkout origin/feature/lessons

# Browse the files, read the code
# When done, go back to main:
git checkout main
```

---

### Option 3: Copy Individual Files Manually (Safest)

```powershell
# 1. Checkout the feature branch in read-only mode
git fetch origin feature/lessons
git show origin/feature/lessons:LearnITapp/app/LessonIntroScreen.tsx > temp_lesson_intro.tsx

# 2. Review the file content
cat temp_lesson_intro.tsx

# 3. If you like it, copy it to the real location
cp temp_lesson_intro.tsx LearnITapp/app/LessonIntroScreen.tsx

# 4. Repeat for other files
git show origin/feature/lessons:LearnITapp/app/ReadLesson.tsx > LearnITapp/app/ReadLesson.tsx
git show origin/feature/lessons:LearnITapp/app/WatchLesson.tsx > LearnITapp/app/WatchLesson.tsx
git show origin/feature/lessons:LearnITapp/constants/lessonContent.ts > LearnITapp/constants/lessonContent.ts

# 5. Clean up temp file
rm temp_lesson_intro.tsx
```

---

## 🔍 View What Changed in feature/lessons

### See All Files Changed
```powershell
git fetch origin feature/lessons
git diff --name-status origin/main origin/feature/lessons
```

**Output:**
```
M       LearnITapp/app/ExploreScenarios.tsx       ← Modified (you probably don't want)
M       LearnITapp/app/FirstQuarter.tsx           ← Modified
A       LearnITapp/app/LessonIntroScreen.tsx      ← Added (NEW - you want this!)
M       LearnITapp/app/LessonScreenNew.tsx        ← Modified
A       LearnITapp/app/ReadLesson.tsx             ← Added (NEW - you want this!)
A       LearnITapp/app/WatchLesson.tsx            ← Added (NEW - you want this!)
...
```

**Legend:**
- `A` = Added (new file)
- `M` = Modified (existing file changed)
- `D` = Deleted (file removed)

### See Content of a Specific File
```powershell
# View the entire new file
git show origin/feature/lessons:LearnITapp/app/LessonIntroScreen.tsx

# View the diff for a modified file
git diff origin/main origin/feature/lessons -- LearnITapp/app/LessonScreenNew.tsx
```

---

## 📦 What Files Exist in feature/lessons

### New Files (Added - you probably want these)
```
✅ LearnITapp/app/LessonIntroScreen.tsx
✅ LearnITapp/app/ReadLesson.tsx
✅ LearnITapp/app/WatchLesson.tsx
✅ LearnITapp/constants/lessonContent.ts
✅ LearnITapp/assets/images/LandingLogo2.png
```

### Modified Files (Changed - review before taking)
```
⚠️ LearnITapp/app/ExploreScenarios.tsx
⚠️ LearnITapp/app/FirstQuarter.tsx
⚠️ LearnITapp/app/GamesScreen.tsx
⚠️ LearnITapp/app/HomeScreen.tsx
⚠️ LearnITapp/app/LessonScreenNew.tsx     ← Your groupmate modified this
⚠️ LearnITapp/app/LoginScreen.tsx
⚠️ LearnITapp/app/ProfileScreen.tsx
⚠️ LearnITapp/app/SignUpScreen.tsx
⚠️ LearnITapp/app/WelcomeScreen.tsx
⚠️ LearnITapp/components/BottomNav.tsx
⚠️ LearnITapp/config/api.ts
⚠️ LearnITapp/config/api_probe.ts
⚠️ LearnITapp/package-lock.json
⚠️ README.md
⚠️ src/database/scisteps.db-shm
⚠️ src/database/scisteps.db-wal
```

**Why so many modified files?**
- Likely due to auto-formatting (Prettier)
- Package updates (`package-lock.json`)
- Database changes (`.db-shm`, `.db-wal` are temporary SQLite files)

**What to do about them:**
- Only take the code changes you need
- Ignore formatting-only changes
- Database files should NOT be in Git (add to `.gitignore`)

---

## 🔧 Workflow for Your Team (Going Forward)

### For the Person Creating a Branch:

```powershell
# 1. Always start from main
git checkout main
git pull origin main

# 2. Create a focused feature branch
git checkout -b feature/lesson-intro-screen  # Specific name!

# 3. ONLY add/modify the files related to your feature
# Bad:  Modifying 20 files
# Good: Adding 2-3 new files, modifying 1-2 related files

# 4. Commit frequently with clear messages
git add LearnITapp/app/LessonIntroScreen.tsx
git commit -m "Add LessonIntroScreen component"

# 5. Push to GitHub
git push origin feature/lesson-intro-screen

# 6. Create a Pull Request on GitHub
# Title: "Add Lesson Intro Screen"
# Description: What you added/changed
```

### For the Person Reviewing a Branch:

```powershell
# 1. Fetch the branch
git fetch origin feature/lesson-intro-screen

# 2. Create a review branch
git checkout -b review-lesson-intro
git merge origin/feature/lesson-intro-screen

# 3. Test thoroughly
npm install  # If dependencies changed
npx expo start

# 4. If it works, merge to main
git checkout main
git merge review-lesson-intro
git push origin main

# 5. Clean up
git branch -d review-lesson-intro
git push origin --delete feature/lesson-intro-screen  # Delete remote branch
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "I checked out the branch and now my files are different!"

**Solution:**
```powershell
# Go back to main
git checkout main

# Reset any uncommitted changes
git reset --hard origin/main

# Start fresh with Option 1 above
```

### Issue 2: "I want to see the file but not download it"

**Solution:**
```powershell
# View on GitHub
# https://github.com/docurev111/LearnIT/blob/feature/lessons/LearnITapp/app/LessonIntroScreen.tsx

# Or view in terminal
git show origin/feature/lessons:LearnITapp/app/LessonIntroScreen.tsx | less
```

### Issue 3: "Merge conflicts after cherry-picking"

**Solution:**
```powershell
# If you get conflicts, you can:

# Option A: Abort and try manually
git merge --abort

# Option B: Resolve conflicts
# Edit the conflicted files
# Remove the <<<<, ====, >>>> markers
git add .
git commit -m "Resolve conflicts"
```

### Issue 4: "I want only PART of a file change"

**Solution:**
```powershell
# Interactive patch mode
git checkout -p origin/feature/lessons -- LearnITapp/app/LessonScreenNew.tsx

# Git will show each change ("hunk") and ask:
# y = yes, take this change
# n = no, skip this change
# s = split into smaller hunks
# q = quit
```

---

## 📚 Git Commands Reference

| Command | Purpose |
|---------|---------|
| `git fetch origin <branch>` | Download branch data without merging |
| `git checkout origin/<branch>` | View branch in read-only mode |
| `git checkout -b <new-branch>` | Create and switch to new branch |
| `git checkout <branch> -- <file>` | Copy file from another branch |
| `git show <branch>:<file>` | View file content from branch |
| `git diff <branch1> <branch2> -- <file>` | Compare file between branches |
| `git diff --name-status <branch1> <branch2>` | List changed files |
| `git reset --hard origin/main` | Discard all local changes, match main |

---

## ✅ Best Practices

1. **Always work in feature branches**
   - Never commit directly to `main`
   - Create branch: `feature/specific-thing`

2. **Keep feature branches small**
   - 1-3 files max
   - Focus on ONE feature

3. **Use Pull Requests**
   - Create PR on GitHub: `feature/x` → `main`
   - Review code before merging
   - Require at least 1 approval

4. **Pull main frequently**
   ```powershell
   git checkout main
   git pull origin main
   git checkout feature/your-feature
   git merge main  # Keep your branch up to date
   ```

5. **Clean up merged branches**
   ```powershell
   # After merging to main
   git branch -d feature/old-feature          # Delete local
   git push origin --delete feature/old-feature  # Delete remote
   ```

---

## 🎯 TL;DR - Quick Answer to Your Question

**"How do I get only the new files from `feature/lessons` without merging everything?"**

```powershell
# Run this:
cd d:\LearnIT
git fetch origin feature/lessons
git checkout -b temp-review
git checkout origin/feature/lessons -- LearnITapp/app/LessonIntroScreen.tsx
git checkout origin/feature/lessons -- LearnITapp/app/ReadLesson.tsx
git checkout origin/feature/lessons -- LearnITapp/app/WatchLesson.tsx
git checkout origin/feature/lessons -- LearnITapp/constants/lessonContent.ts
git status  # See what was added
cd LearnITapp
npx expo start  # Test it
```

**If it works:**
```powershell
git add .
git commit -m "Add new lesson screens from feature/lessons"
# Keep in temp-review branch or merge to main when ready
```

**If you want to discard:**
```powershell
git checkout main
git branch -D temp-review  # Force delete
```

---

**Questions?** Refer to this guide or ask for clarification on specific files.
