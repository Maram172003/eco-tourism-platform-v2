#!/bin/bash
set -e

SRC_BACKEND="/home/himawari/workSpace/tourisme/backend/src"
SRC_FRONTEND="/home/himawari/workSpace/tourisme/frontend"
BRANCH_NAME="feature/pr4-modules"

echo "=============================="
echo "PR #4 — ORIGINAL BACKEND"
echo "=============================="

cd /tmp/eco-tourism-platform-backend
git checkout main
git pull origin main
git checkout -b "$BRANCH_NAME"

mkdir -p src/booking/dto src/booking/entities
mkdir -p src/circuit/dto src/circuit/entities
mkdir -p src/notification/dto src/notification/entities
mkdir -p src/trip-plan/dto src/trip-plan/entities
mkdir -p src/offer/entities
mkdir -p src/database/seeds

cp -r "$SRC_BACKEND/booking/"* src/booking/
cp -r "$SRC_BACKEND/circuit/"* src/circuit/
cp -r "$SRC_BACKEND/notification/"* src/notification/
cp -r "$SRC_BACKEND/trip-plan/"* src/trip-plan/

# Les 6 entités offer-item
cp "$SRC_BACKEND/offer/entities/offer-category.entity.ts" src/offer/entities/
cp "$SRC_BACKEND/offer/entities/offer-item.entity.ts" src/offer/entities/
cp "$SRC_BACKEND/offer/entities/offer-item-price.entity.ts" src/offer/entities/
cp "$SRC_BACKEND/offer/entities/offer-item-capacity.entity.ts" src/offer/entities/
cp "$SRC_BACKEND/offer/entities/offer-item-availability-rule.entity.ts" src/offer/entities/
cp "$SRC_BACKEND/offer/entities/offer-item-session.entity.ts" src/offer/entities/
cp "$SRC_BACKEND/database/seeds/offer-categories.seed.ts" src/database/seeds/

git add src/booking/ src/circuit/ src/notification/ src/trip-plan/ src/offer/entities/offer-category.entity.ts src/offer/entities/offer-item.entity.ts src/offer/entities/offer-item-price.entity.ts src/offer/entities/offer-item-capacity.entity.ts src/offer/entities/offer-item-availability-rule.entity.ts src/offer/entities/offer-item-session.entity.ts src/database/seeds/offer-categories.seed.ts

git commit -m "feat: PR #4 - Modules booking, circuit, notification, trip-plan + 6 entités offer-item"
git push -u origin "$BRANCH_NAME" 2>&1 || (gh repo fork --remote=true 2>/dev/null; git push -u origin "$BRANCH_NAME" 2>&1)
gh pr create --title "PR #4: Modules booking, circuit, notification, trip-plan + entités offer-item" --body "Nouveaux modules backend :
- Booking (réservations avec participants)
- Circuit (circuits multi-jours avec programme)
- Notification (notifications utilisateur)
- TripPlan (plans de voyage avec réservation groupée)
- 6 entités offer-item : item, price, capacity, availability rule, session, category
- Seed offer-categories" --base main 2>&1 || echo "PR backend original déjà créée ou erreur"

echo "✓ PR #4 backend original faite"
echo ""
echo "=============================="
echo "PR #4 — ORIGINAL FRONTEND"
echo "=============================="

cd /tmp/eco-tourism-platform-front
git checkout main
git pull origin main
git checkout -b "$BRANCH_NAME"

mkdir -p app/circuits/\[id\]
mkdir -p app/notifications
mkdir -p app/trip-plans/new app/trip-plans/\[id\]
mkdir -p app/reservations/new

cp -r "$SRC_FRONTEND/app/circuits/"* app/circuits/
cp -r "$SRC_FRONTEND/app/notifications/"* app/notifications/
cp -r "$SRC_FRONTEND/app/trip-plans/"* app/trip-plans/
cp -r "$SRC_FRONTEND/app/reservations/"* app/reservations/

git add app/circuits/ app/notifications/ app/trip-plans/ app/reservations/
git commit -m "feat: PR #4 - Pages circuits, notifications, trip-plans, réservations"
git push -u origin "$BRANCH_NAME" 2>&1 || (gh repo fork --remote=true 2>/dev/null; git push -u origin "$BRANCH_NAME" 2>&1)
gh pr create --title "PR #4: Pages circuits, notifications, trip-plans, réservations" --body "Nouvelles pages frontend :
- Circuits (liste + détail avec itinéraire)
- Notifications (liste + marquer lu)
- TripPlans (liste, création, détail avec réservation groupée)
- Réservations (nouvelle réservation)" --base main 2>&1 || echo "PR frontend original déjà créée ou erreur"

echo "✓ PR #4 frontend original faite"
echo ""
echo "=============================="
echo "PR #4 — V2 BACKEND"
echo "=============================="

cd /tmp/eco-tourism-platform-v2/eco-tourism-platform-backend
git checkout main 2>/dev/null || git checkout master 2>/dev/null || true
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
git checkout -b "$BRANCH_NAME"

mkdir -p src/booking/dto src/booking/entities
mkdir -p src/circuit/dto src/circuit/entities
mkdir -p src/notification/dto src/notification/entities
mkdir -p src/trip-plan/dto src/trip-plan/entities
mkdir -p src/offer/entities
mkdir -p src/database/seeds

cp -r "$SRC_BACKEND/booking/"* src/booking/
cp -r "$SRC_BACKEND/circuit/"* src/circuit/
cp -r "$SRC_BACKEND/notification/"* src/notification/
cp -r "$SRC_BACKEND/trip-plan/"* src/trip-plan/
cp "$SRC_BACKEND/offer/entities/offer-category.entity.ts" src/offer/entities/
cp "$SRC_BACKEND/offer/entities/offer-item.entity.ts" src/offer/entities/
cp "$SRC_BACKEND/offer/entities/offer-item-price.entity.ts" src/offer/entities/
cp "$SRC_BACKEND/offer/entities/offer-item-capacity.entity.ts" src/offer/entities/
cp "$SRC_BACKEND/offer/entities/offer-item-availability-rule.entity.ts" src/offer/entities/
cp "$SRC_BACKEND/offer/entities/offer-item-session.entity.ts" src/offer/entities/
cp "$SRC_BACKEND/database/seeds/offer-categories.seed.ts" src/database/seeds/

git add src/booking/ src/circuit/ src/notification/ src/trip-plan/ src/offer/entities/offer-category.entity.ts src/offer/entities/offer-item.entity.ts src/offer/entities/offer-item-price.entity.ts src/offer/entities/offer-item-capacity.entity.ts src/offer/entities/offer-item-availability-rule.entity.ts src/offer/entities/offer-item-session.entity.ts src/database/seeds/offer-categories.seed.ts

git commit -m "feat: PR #4 - Modules booking, circuit, notification, trip-plan + entités offer-item"
git push -u origin "$BRANCH_NAME" 2>&1 || (gh repo fork --remote=true 2>/dev/null; git push -u origin "$BRANCH_NAME" 2>&1)
gh pr create --title "PR #4: Modules booking, circuit, notification, trip-plan + entités offer-item" --body "Nouveaux modules backend :
- Booking (réservations avec participants)
- Circuit (circuits multi-jours avec programme)
- Notification (notifications utilisateur)
- TripPlan (plans de voyage avec réservation groupée)
- 6 entités offer-item : item, price, capacity, availability rule, session, category
- Seed offer-categories" --base main 2>&1 || gh pr create --title "PR #4: Modules booking, circuit, notification, trip-plan + entités offer-item" --body "Nouveaux modules backend" --base master 2>&1 || echo "PR v2 backend déjà créée ou erreur"

echo "✓ PR #4 v2 backend faite"
echo ""
echo "=============================="
echo "PR #4 — V2 FRONTEND"
echo "=============================="

cd /tmp/eco-tourism-platform-v2/eco-tourism-platform-front
git checkout main 2>/dev/null || git checkout master 2>/dev/null || true
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
git checkout -b "$BRANCH_NAME"

mkdir -p app/circuits/\[id\]
mkdir -p app/notifications
mkdir -p app/trip-plans/new app/trip-plans/\[id\]
mkdir -p app/reservations/new

cp -r "$SRC_FRONTEND/app/circuits/"* app/circuits/
cp -r "$SRC_FRONTEND/app/notifications/"* app/notifications/
cp -r "$SRC_FRONTEND/app/trip-plans/"* app/trip-plans/
cp -r "$SRC_FRONTEND/app/reservations/"* app/reservations/

git add app/circuits/ app/notifications/ app/trip-plans/ app/reservations/
git commit -m "feat: PR #4 - Pages circuits, notifications, trip-plans, réservations"
git push -u origin "$BRANCH_NAME" 2>&1 || (gh repo fork --remote=true 2>/dev/null; git push -u origin "$BRANCH_NAME" 2>&1)
gh pr create --title "PR #4: Pages circuits, notifications, trip-plans, réservations" --body "Nouvelles pages frontend :
- Circuits (liste + détail avec itinéraire)
- Notifications (liste + marquer lu)
- TripPlans (liste, création, détail avec réservation groupée)
- Réservations (nouvelle réservation)" --base main 2>&1 || gh pr create --title "PR #4: Pages circuits, notifications, trip-plans, réservations" --body "Nouvelles pages frontend" --base master 2>&1 || echo "PR v2 frontend déjà créée ou erreur"

echo "✓ PR #4 v2 frontend faite"
echo ""
echo "✅ PR #4 COMPLÈTE — original + v2"
