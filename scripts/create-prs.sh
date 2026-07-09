#!/bin/bash
set -e

echo "Création des PRs pour Maram..."

# PR Frontend
cd /tmp
rm -rf eco-tourism-platform-front
gh repo clone Maram172003/eco-tourism-platform-front
cd eco-tourism-platform-front
git checkout -b feature/full-integration
cp -a /home/himawari/workSpace/tourisme/frontend/* ./ || true
git add .
git commit -m "Integration globale: catalogue, réservations, circuits, cartes, notifications" || true
gh repo fork --remote=true
git push -u origin feature/full-integration
gh pr create --title "Feature: Intégration globale (Catalogue, Réservations, Circuits)" --body "Contient toutes les modifications frontend pour le système de réservation, circuits, upload d'images, cartes interactives et corrections de bugs."

# PR Backend
cd /tmp
rm -rf eco-tourism-platform-backend
gh repo clone Maram172003/eco-tourism-platform-backend
cd eco-tourism-platform-backend
git checkout -b feature/full-integration
cp -a /home/himawari/workSpace/tourisme/backend/* ./ || true
cp /home/himawari/workSpace/tourisme/scripts/seed.sql ./src/ || true
git add .
git commit -m "Integration globale: booking, circuit, notification, trip-plan et entités" || true
gh repo fork --remote=true
git push -u origin feature/full-integration
gh pr create --title "Feature: Intégration globale backend" --body "Contient tous les modules NestJS (Booking, Circuit, Notification, TripPlan) et les mises à jour des entités TypeORM avec le fichier seed.sql"

echo "PRs créés avec succès !"
