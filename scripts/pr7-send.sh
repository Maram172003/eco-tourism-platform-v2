#!/bin/bash
set -e

SRC_BACKEND="/home/himawari/workSpace/tourisme/backend"
SRC_FRONTEND="/home/himawari/workSpace/tourisme/frontend"
BRANCH_NAME="feature/pr7-circuits-offers-activities-pricing"
PR_DESC="/home/himawari/workSpace/tourisme/docs/PR_DESCRIPTION.md"
PR_BODY=$(cat "$PR_DESC")

echo "=============================="
echo "PR #7 — V2 BACKEND"
echo "=============================="

cd /tmp/eco-tourism-platform-v2/eco-tourism-platform-backend
git checkout main 2>/dev/null || git checkout master 2>/dev/null || true
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
git branch -D "$BRANCH_NAME" 2>/dev/null || true
git checkout -b "$BRANCH_NAME"

# Copier tout le backend
cp -r "$SRC_BACKEND/src/"* src/
cp "$SRC_BACKEND/package.json" ./ 2>/dev/null || true
cp "$SRC_BACKEND/tsconfig.json" ./ 2>/dev/null || true
cp "$SRC_BACKEND/nest-cli.json" ./ 2>/dev/null || true

git add -A
git commit -m "feat: PR #7 - Circuits multi-jours, offres enrichies, 3 types d'activités, hébergement intelligent, tarification à 3 sources" 2>/dev/null || echo "Nothing to commit"
git push -u origin "$BRANCH_NAME" --force 2>&1

# Supprimer l'ancienne PR si elle existe
gh pr list --head "$BRANCH_NAME" --json number -q '.[].number' | xargs -r gh pr close 2>/dev/null || true

gh pr create \
  --title "PR #7: Circuits Multi-Jours, Offres, Activités, Hébergement & Tarification" \
  --body-file "$PR_DESC" \
  --base main 2>&1 || \
gh pr create \
  --title "PR #7: Circuits Multi-Jours, Offres, Activités, Hébergement & Tarification" \
  --body-file "$PR_DESC" \
  --base master 2>&1 || \
echo "PR v2 backend déjà créée ou erreur"

echo "✓ PR #7 v2 backend faite"
echo ""

echo "=============================="
echo "PR #7 — V2 FRONTEND"
echo "=============================="

cd /tmp/eco-tourism-platform-v2/eco-tourism-platform-front
git checkout main 2>/dev/null || git checkout master 2>/dev/null || true
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
git branch -D "$BRANCH_NAME" 2>/dev/null || true
git checkout -b "$BRANCH_NAME"

# Copier tout le frontend
cp -r "$SRC_FRONTEND/app/"* app/ 2>/dev/null || true
cp -r "$SRC_FRONTEND/components/"* components/ 2>/dev/null || true
cp -r "$SRC_FRONTEND/lib/"* lib/ 2>/dev/null || true
cp "$SRC_FRONTEND/package.json" ./ 2>/dev/null || true
cp "$SRC_FRONTEND/tsconfig.json" ./ 2>/dev/null || true
cp "$SRC_FRONTEND/next.config.ts" ./ 2>/dev/null || true
cp "$SRC_FRONTEND/tailwind.config.ts" ./ 2>/dev/null || true
cp "$SRC_FRONTEND/postcss.config.mjs" ./ 2>/dev/null || true
cp "$SRC_FRONTEND/eslint.config.mjs" ./ 2>/dev/null || true

git add -A
git commit -m "feat: PR #7 - Circuits multi-jours, offres enrichies, 3 types d'activités, hébergement intelligent, tarification à 3 sources" 2>/dev/null || echo "Nothing to commit"
git push -u origin "$BRANCH_NAME" --force 2>&1

# Supprimer l'ancienne PR si elle existe
gh pr list --head "$BRANCH_NAME" --json number -q '.[].number' | xargs -r gh pr close 2>/dev/null || true

gh pr create \
  --title "PR #7: Circuits Multi-Jours, Offres, Activités, Hébergement & Tarification" \
  --body-file "$PR_DESC" \
  --base main 2>&1 || \
gh pr create \
  --title "PR #7: Circuits Multi-Jours, Offres, Activités, Hébergement & Tarification" \
  --body-file "$PR_DESC" \
  --base master 2>&1 || \
echo "PR v2 frontend déjà créée ou erreur"

echo "✓ PR #7 v2 frontend faite"
echo ""
echo "✅ PR #7 COMPLÈTE — v2 backend + v2 frontend"
