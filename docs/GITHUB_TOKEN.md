# GitHub Token Configuration

## Overview

The NX Projects Tracker uses GitHub's API to fetch repository information. GitHub has rate limits that affect how many requests you can make per hour.

## Rate Limits

| Token Type | Requests/Hour | Use Case |
|------------|---------------|----------|
| **No Token** | 60 | Unauthenticated requests |
| **GITHUB_TOKEN** | 1,000 | GitHub Actions default token |
| **Personal Access Token** | 5,000 | Higher limits for development |

## Automatic Token (GitHub Actions)

When running in GitHub Actions, the workflow automatically uses `${{ secrets.GITHUB_TOKEN }}`:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This token:
- ✅ Is automatically provided by GitHub
- ✅ Has 1,000 requests/hour limit
- ✅ Is sufficient for most use cases
- ✅ No setup required

## Personal Access Token (Optional)

For local development or higher limits, you can create a personal access token:

### Creating a Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `public_repo` (for public repositories)
   - `repo` (for private repositories, if needed)
4. Copy the generated token

### Using the Token

#### Local Development
```bash
export GITHUB_TOKEN=your_token_here
npm start
```

#### Environment File
Create a `.env` file:
```
GITHUB_TOKEN=your_token_here
```

#### GitHub Actions (Custom Token)
If you need higher limits in GitHub Actions, add your token as a repository secret:

1. Go to repository Settings → Secrets and variables → Actions
2. Add new repository secret named `CUSTOM_GITHUB_TOKEN`
3. Update the workflow:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.CUSTOM_GITHUB_TOKEN }}
```

## When You Need a Personal Token

- **Large project lists**: More than 50 projects
- **Frequent updates**: Running tracker multiple times per hour
- **Development**: Testing and debugging
- **Private repositories**: Access to private repos

## Security Notes

- Never commit tokens to version control
- Use repository secrets in GitHub Actions
- Personal tokens should have minimal required permissions
- Rotate tokens regularly

## Troubleshooting

### Rate Limit Exceeded
```
Error: GitHub API error: 403 Forbidden
```

**Solutions:**
1. Wait for rate limit reset (usually 1 hour)
2. Use a personal access token
3. Reduce the number of projects
4. Increase delay between requests

### Token Not Working
```
Error: GitHub API error: 401 Unauthorized
```

**Solutions:**
1. Check token permissions
2. Verify token is valid
3. Ensure token has correct scopes 