#!/bin/bash
set -e

SRC_BACKEND="/home/himawari/workSpace/tourisme/backend/src"
SRC_FRONTEND="/home/himawari/workSpace/tourisme/frontend"
BRANCH_NAME="feature/pr6-photo-places-heatmap"

echo "=============================="
echo "PR #6 — ORIGINAL BACKEND"
echo "=============================="

cd /tmp/eco-tourism-platform-backend
git checkout main
git pull origin main
git checkout -b "$BRANCH_NAME"

mkdir -p src/photo/dto src/photo/entities

cp -r "$SRC_BACKEND/photo/"* src/photo/

git add src/photo/
git commit -m "feat: PR #6 - Module photo (upload, votes, hero image)"
git push -u origin "$BRANCH_NAME" 2>&1 || (gh repo fork --remote=true 2>/dev/null; git push -u origin "$BRANCH_NAME" 2>&1)
gh pr create --title "PR #6: Module photo (upload, votes, hero image)" --body "Nouveau module backend :
- Photo (upload, upvote/downvote, hero image, galerie par entité)" --base main 2>&1 || echo "PR backend original déjà créée ou erreur"

echo "✓ PR #6 backend original faite"
echo ""

echo "=============================="
echo "PR #6 — ORIGINAL FRONTEND"
echo "=============================="

cd /tmp/eco-tourism-platform-front
git checkout main
git pull origin main
git checkout -b "$BRANCH_NAME"

mkdir -p app/places/\[id\]
mkdir -p components/map

cp -r "$SRC_FRONTEND/app/places/"* app/places/
cp "$SRC_FRONTEND/components/map/HeatmapLayer.tsx" components/map/
cp "$SRC_FRONTEND/lib/distance.ts" lib/

git add app/places/ components/map/HeatmapLayer.tsx lib/distance.ts
git commit -m "feat: PR #6 - Pages lieux, HeatmapLayer, distance util"
git push -u origin "$BRANCH_NAME" 2>&1 || (gh repo fork --remote=true 2>/dev/null; git push -u origin "$BRANCH_NAME" 2>&1)
gh pr create --title "PR #6: Pages lieux, HeatmapLayer, distance util" --body "Nouvelles pages et composants frontend :
- Pages lieux (liste + détail enrichi avec galerie, offres, circuits, avis, météo, carte, événements)
- HeatmapLayer (carte de chaleur Leaflet)
- distance.ts (calcul distance Haversine)" --base main 2>&1 || echo "PR frontend original déjà créée ou erreur"

echo "✓ PR #6 frontend original faite"
echo ""

echo "=============================="
echo "PR #6 — V2 BACKEND"
echo "=============================="

cd /tmp/eco-tourism-platform-v2/eco-tourism-platform-backend
git checkout main 2>/dev/null || git checkout master 2>/dev/null || true
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
git checkout -b "$BRANCH_NAME"

mkdir -p src/photo/dto src/photo/entities
cp -r "$SRC_BACKEND/photo/"* src/photo/

git add src/photo/
git commit -m "feat: PR #6 - Module photo (upload, votes, hero image)"
git push -u origin "$BRANCH_NAME" 2>&1 || (gh repo fork --remote=true 2>/dev/null; git push -u origin "$BRANCH_NAME" 2>&1)
gh pr create --title "PR #6: Module photo (upload, votes, hero image)" --body "Nouveau module backend : Photo" --base main 2>&1 || gh pr create --title "PR #6: Module photo (upload, votes, hero image)" --body "Nouveau module backend : Photo" --base master 2>&1 || echo "PR v2 backend déjà créée ou erreur"

echo "✓ PR #6 v2 backend faite"
echo ""

echo "=============================="
echo "PR #6 — V2 FRONTEND"
echo "=============================="

cd /tmp/eco-tourism-platform-v2/eco-tourism-platform-front
git checkout main 2>/dev/null || git checkout master 2>/dev/null || true
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
git branch -D "$BRANCH_NAME" 2>/dev/null || true
git checkout -b "$BRANCH_NAME"

mkdir -p app/places/\[id\]
mkdir -p components/map

cp -r "$SRC_FRONTEND/app/places/"* app/places/
cp "$SRC_FRONTEND/components/map/HeatmapLayer.tsx" components/map/
cp "$SRC_FRONTEND/lib/distance.ts" lib/

git add app/places/ components/map/HeatmapLayer.tsx lib/distance.ts
git commit -m "feat: PR #6 - Pages lieux, HeatmapLayer, distance util"
git push -u origin "$BRANCH_NAME" --force 2>&1
gh pr create --title "PR #6: Pages lieux, HeatmapLayer, distance util" --body "Nouvelles pages et composants frontend : Pages lieux, HeatmapLayer, distance.ts" --base main 2>&1 || gh pr create --title "PR #6: Pages lieux, HeatmapLayer, distance util" --body "Nouvelles pages et composants frontend" --base master 2>&1 || echo "PR v2 frontend déjà créée ou erreur"

echo "✓ PR #6 v2 frontend faite"
echo ""
echo "✅ PR #6 COMPLÈTE — original + v2"
