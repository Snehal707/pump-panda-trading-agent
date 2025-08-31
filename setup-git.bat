@echo off
echo Setting up Git repository for Recall Agent...
echo.

echo Current Git status:
git status

echo.
echo Making initial commit...
git commit -m "Initial commit: Recall Agent with blockchain trading capabilities"

echo.
echo Git repository setup complete!
echo.
echo Next steps:
echo 1. Create a repository on GitHub/GitLab/Bitbucket
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_REPOSITORY_URL
echo 4. Run: git push -u origin main
echo.
pause
