---
description: Always push and deploy after completing a task
---

Whenever a significant change is made or at the end of a work session, follow these steps to ensure the production environment is updated:

// turbo
1. Sync database if needed (if schema was modified):
   `powershell -ExecutionPolicy Bypass -Command "npx prisma db push"`

// turbo
2. Commit and push changes to trigger Vercel deployment:
   `git add . ; git commit -m "Auto-deploy: [brief description of changes]" ; git push`

3. Verify the deployment status on Vercel if possible or wait for the GitHub Action to complete.
