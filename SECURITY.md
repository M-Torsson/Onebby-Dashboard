# Security Guidelines

## Environment Variables

This project uses environment variables to store sensitive information. Follow these guidelines:

### Never Commit These Files

- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- Any file containing API keys or credentials

### Required Environment Variables

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_API_KEY=your-actual-api-key
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset-name
```

### Files Already Excluded from Git

The following files are automatically excluded via `.gitignore`:

- Utility scripts with hardcoded credentials
- Temporary documentation files
- Environment files
- Build artifacts
- Node modules
- IDE settings

### Before Pushing to GitHub

1. Verify no API keys are in source code
2. Check that `.env.local` is not tracked
3. Review `.gitignore` to ensure all sensitive files are excluded
4. Use `.env.example` as a template (without real values)

### If You Accidentally Commit Secrets

1. Immediately rotate/change all exposed credentials
2. Remove the secret from Git history
3. Force push the cleaned history
4. Notify the team

## Best Practices

- Store all credentials in environment variables
- Use different API keys for development and production
- Regularly rotate API keys
- Never log sensitive information
- Use HTTPS for all API communications
