#!/bin/bash
# ============================================================================
# Run comprehensive seed data via Docker
# ============================================================================
# Usage: bash scripts/run-seed.sh
# ============================================================================

set -e

echo "🌱 Running comprehensive seed data..."

# Detect container name
CONTAINER=$(docker ps --format '{{.Names}}' | grep -i "db" | head -1)

if [ -z "$CONTAINER" ]; then
  echo "❌ No database container found. Is Docker running?"
  echo "   Try: docker compose up -d db"
  exit 1
fi

echo "   Using container: $CONTAINER"

# Run the seed script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
docker exec -i "$CONTAINER" psql -U marammejri -d tourism_db < "$SCRIPT_DIR/seed-comprehensive.sql"

echo ""
echo "✅ Seed complete!"
echo ""
echo "   Users created:"
echo "   ┌──────────────────────────────┬──────────────────┬──────────┬──────────┐"
echo "   │ Email                        │ Mot de passe     │ Rôle     │ Status   │"
echo "   ├──────────────────────────────┼──────────────────┼──────────┼──────────┤"
echo "   │ fakerbennomen@gmail.com      │ Test1234!        │ project  │ active   │"
echo "   │ f.akerbennomen@gmail.com     │ Test1234!        │ project  │ active   │"
echo "   │ fa.kerbennomen@gmail.com     │ Test1234!        │ guide    │ active   │"
echo "   │ amir.guide@ecovoyage.tn      │ Test1234!        │ guide    │ active   │"
echo "   │ leila.guide@ecovoyage.tn     │ Test1234!        │ guide    │ pending  │"
echo "   │ sami.owner@ecovoyage.tn      │ Test1234!        │ project  │ active   │"
echo "   │ ines.voyageur@ecovoyage.tn   │ Test1234!        │ traveler │ active   │"
echo "   │ karim.voyageur@ecovoyage.tn  │ Test1234!        │ traveler │ active   │"
echo "   │ admin@ecovoyage.tn           │ Test1234!        │ admin    │ active   │"
echo "   └──────────────────────────────┴──────────────────┴──────────┴──────────┘"
echo ""
echo "   📦 8 offres créées (hébergement, transport, atelier, randonnée, artisanat, restauration, guide, kayak)"
echo "   🗺️  4 circuits créés (Djerba, Nord, Sud, Kairouan)"
echo "   📋 2 trip plans créés"
echo "   🔔 Notifications créées"
echo "   💬 Messages créés"
echo "   ⭐ Avis créés"
