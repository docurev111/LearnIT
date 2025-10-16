# Firebase Service Account Key Setup

## 🔐 Security Notice

**NEVER commit service account keys to git!** These credentials provide full administrative access to your Firebase project.

## Current Setup

### Local Development

The backend (`src/firebase.js`) loads credentials from:
1. **Environment variable** `FIREBASE_SERVICE_ACCOUNT_JSON` (preferred for production)
2. **Local file** `src/serviceAccountKey.json` (for local development)

### Files Protected by .gitignore

The following patterns are excluded from version control:
- `**/serviceAccountKey.json`
- `**/*firebase*adminsdk*.json`
- `scisteps-*.json`

## Setting Up Your Local Environment

### Step 1: Obtain Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `scisteps-a1f37`
3. Navigate to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file

### Step 2: Place the Key File

Save the downloaded key as:
```
d:\LearnIT\src\serviceAccountKey.json
```

The file should have this structure:
```json
{
  "type": "service_account",
  "project_id": "scisteps-a1f37",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-fbsvc@scisteps-a1f37.iam.gserviceaccount.com",
  ...
}
```

### Step 3: Verify It's Ignored

Run this command to confirm git will ignore the file:
```powershell
git check-ignore -v src/serviceAccountKey.json
```

You should see:
```
.gitignore:125:**/serviceAccountKey.json        src/serviceAccountKey.json
```

## Production Deployment

For production servers, use environment variables instead of files:

```bash
export FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

Or use a secure secrets manager (Azure Key Vault, AWS Secrets Manager, etc.).

## Key Rotation

If a key is accidentally exposed:

1. **Immediately** go to Firebase Console > Service Accounts
2. Delete the compromised key
3. Generate a new key
4. Update your local `serviceAccountKey.json`
5. Update production environment variables
6. If committed to git, consider using [git-filter-repo](https://github.com/newren/git-filter-repo) to remove from history

## Team Onboarding Checklist

- [ ] Install Node.js and npm
- [ ] Clone the repository
- [ ] Request service account key from project admin
- [ ] Place key in `src/serviceAccountKey.json`
- [ ] Verify `.gitignore` is protecting the file
- [ ] Never share the key via email, chat, or public channels

## Questions?

Contact the project maintainer for access to service account keys.
