#!/bin/bash
set -e

SRC_BACKEND="/home/himawari/workSpace/tourisme/backend/src"
SRC_FRONTEND="/home/himawari/workSpace/tourisme/frontend"
BRANCH_NAME="feature/pr5-favorites-reviews-cart-analytics"

echo "=============================="
echo "PR #5 — ORIGINAL BACKEND"
echo "=============================="

cd /tmp/eco-tourism-platform-backend
git checkout main
git pull origin main
git checkout -b "$BRANCH_NAME"

mkdir -p src/favorite/dto src/favorite/entities
mkdir -p src/review/dto src/review/entities
mkdir -p src/travel-cart/dto src/travel-cart/entities

cp -r "$SRC_BACKEND/favorite/"* src/favorite/
cp -r "$SRC_BACKEND/review/"* src/review/
cp -r "$SRC_BACKEND/travel-cart/"* src/travel-cart/

git add src/favorite/ src/review/ src/travel-cart/
git commit -m "feat: PR #5 - Modules favorite, review, travel-cart"
git push -u origin "$BRANCH_NAME" 2>&1 || (gh repo fork --remote=true 2>/dev/null; git push -u origin "$BRANCH_NAME" 2>&1)
gh pr create --title "PR #5: Modules favorite, review, travel-cart" --body "Nouveaux modules backend :
- Favorite (favoris pour offres, circuits, projets, guides)
- Review (avis avec notation 1-5 étoiles)
- TravelCart (panier de voyage temporaire + conversion en TripPlan)" --base main 2>&1 || echo "PR backend original déjà créée ou erreur"

echo "✓ PR #5 backend original faite"
echo ""

echo "=============================="
echo "PR #5 — ORIGINAL FRONTEND"
echo "=============================="

cd /tmp/eco-tourism-platform-front
git checkout main
git pull origin main
git checkout -b "$BRANCH_NAME"

mkdir -p app/cart
mkdir -p components/dashboard/analytics components/dashboard/cards components/dashboard/charts

cp "$SRC_FRONTEND/app/cart/page.tsx" app/cart/
cp "$SRC_FRONTEND/components/CartWidget.tsx" components/
cp "$SRC_FRONTEND/components/dashboard/analytics/EcoTravelerAnalytics.tsx" components/dashboard/analytics/
cp "$SRC_FRONTEND/components/dashboard/analytics/GuideAnalytics.tsx" components/dashboard/analytics/
cp "$SRC_FRONTEND/components/dashboard/analytics/ProjectOwnerAnalytics.tsx" components/dashboard/analytics/
cp "$SRC_FRONTEND/components/dashboard/cards/StatCard.tsx" components/dashboard/cards/
cp "$SRC_FRONTEND/components/dashboard/charts/BarChart.tsx" components/dashboard/charts/
cp "$SRC_FRONTEND/components/dashboard/charts/RevenueChart.tsx" components/dashboard/charts/
cp "$SRC_FRONTEND/components/dashboard/charts/PieChart.tsx" components/dashboard/charts/

git add app/cart/ components/CartWidget.tsx components/dashboard/analytics/ components/dashboard/cards/ components/dashboard/charts/
git commit -m "feat: PR #5 - Page panier + composants dashboard analytics"
git push -u origin "$BRANCH_NAME" 2>&1 || (gh repo fork --remote=true 2>/dev/null; git push -u origin "$BRANCH_NAME" 2>&1)
gh pr create --title "PR #5: Page panier + composants dashboard analytics" --body "Nouvelles pages et composants frontend :
- Page panier (/cart) avec synchronisation guest → connecté
- CartWidget (flottant panier)
- Composants analytics dashboard (EcoTravelerAnalytics, GuideAnalytics, ProjectOwnerAnalytics)
- Composants charts (BarChart, RevenueChart, PieChart)
- StatCard" --base main 2>&1 || echo "PR frontend original déjà créée ou erreur"

echo "✓ PR #5 frontend original faite"
echo ""

echo "=============================="
echo "PR #5 — V2 BACKEND"
echo "=============================="

cd /tmp/eco-tourism-platform-v2/eco-tourism-platform-backend
git checkout main 2>/dev/null || git checkout master 2>/dev/null || true
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
git checkout -b "$BRANCH_NAME"

mkdir -p src/favorite/dto src/favorite/entities
mkdir -p src/review/dto src/review/entities
mkdir -p src/travel-cart/dto src/travel-cart/entities

cp -r "$SRC_BACKEND/favorite/"* src/favorite/
cp -r "$SRC_BACKEND/review/"* src/review/
cp -r "$SRC_BACKEND/travel-cart/"* src/travel-cart/

git add src/favorite/ src/review/ src/travel-cart/
git commit -m "feat: PR #5 - Modules favorite, review, travel-cart"
git push -u origin "$BRANCH_NAME" 2>&1 || (gh repo fork --remote=true 2>/dev/null; git push -u origin "$BRANCH_NAME" 2>&1)
gh pr create --title "PR #5: Modules favorite, review, travel-cart" --body "Nouveaux modules backend :
- Favorite (favoris)
- Review (avis)
- TravelCart (panier)" --base main 2>&1 || gh pr create --title "PR #5: Modules favorite, review, travel-cart" --body "Nouveaux modules backend" --base master 2>&1 || echo "PR v2 backend déjà créée ou erreur"

echo "✓ PR #5 v2 backend faite"
echo ""

echo "=============================="
echo "PR #5 — V2 FRONTEND"
echo "=============================="

cd /tmp/eco-tourism-platform-v2/eco-tourism-platform-front
git checkout main 2>/dev/null || git checkout master 2>/dev/null || true
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
git checkout -b "$BRANCH_NAME"

mkdir -p app/cart
mkdir -p components/dashboard/analytics components/dashboard/cards components/dashboard/charts

cp "$SRC_FRONTEND/app/cart/page.tsx" app/cart/
cp "$SRC_FRONTEND/components/CartWidget.tsx" components/
cp "$SRC_FRONTEND/components/dashboard/analytics/EcoTravelerAnalytics.tsx" components/dashboard/analytics/
cp "$SRC_FRONTEND/components/dashboard/analytics/GuideAnalytics.tsx" components/dashboard/analytics/
cp "$SRC_FRONTEND/components/dashboard/analytics/ProjectOwnerAnalytics.tsx" components/dashboard/analytics/
cp "$SRC_FRONTEND/components/dashboard/cards/StatCard.tsx" components/dashboard/cards/
cp "$SRC_FRONTEND/components/dashboard/charts/BarChart.tsx" components/dashboard/charts/
cp "$SRC_FRONTEND/components/dashboard/charts/RevenueChart.tsx" components/dashboard/charts/
cp "$SRC_FRONTEND/components/dashboard/charts/PieChart.tsx" components/dashboard/charts/

git add app/cart/ components/CartWidget.tsx components/dashboard/analytics/ components/dashboard/cards/ components/dashboard/charts/
git commit -m "feat: PR #5 - Page panier + composants dashboard analytics"
git push -u origin "$BRANCH_NAME" 2>&1 || (gh repo fork --remote=true 2>/dev/null; git push -u origin "$BRANCH_NAME" 2>&1)
gh pr create --title "PR #5: Page panier + composants dashboard analytics" --body "Nouvelles pages et composants frontend :
- Page panier (/cart)
- CartWidget
- Composants analytics + charts" --base main 2>&1 || gh pr create --title "PR #5: Page panier + composants dashboard analytics" --body "Nouvelles pages et composants frontend" --base master 2>&1 || echo "PR v2 frontend déjà créée ou erreur"

echo "✓ PR #5 v2 frontend faite"
echo ""
echo "✅ PR #5 COMPLÈTE — original + v2"
