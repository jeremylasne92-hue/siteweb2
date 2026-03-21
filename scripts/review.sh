#!/bin/bash
# review.sh — Vérifie les décisions dont la révision est due
# Usage: bash scripts/review.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CSV_FILE="$PROJECT_DIR/memory/decisions.csv"

if [ ! -f "$CSV_FILE" ]; then
  echo "Erreur : $CSV_FILE introuvable."
  exit 1
fi

TODAY=$(date +%Y-%m-%d)

echo ""
echo "=== REVUE DES DECISIONS ECHO ==="
echo "Date du jour : $TODAY"
echo ""

DUE_COUNT=0
TOTAL=0

# Lire le CSV ligne par ligne (skip header), sans subshell
while IFS= read -r line; do
  TOTAL=$((TOTAL + 1))

  # Extraire revision_date (avant-dernier champ) et status (dernier champ)
  revision_date=$(echo "$line" | awk -F',' '{print $(NF-1)}' | tr -d '"' | tr -d ' ')
  status=$(echo "$line" | awk -F',' '{print $NF}' | tr -d '"' | tr -d ' ')

  # Ne vérifier que les décisions actives
  if [ "$status" != "actif" ]; then
    continue
  fi

  # Comparer les dates (format YYYY-MM-DD, comparaison lexicographique)
  if [ "$revision_date" \< "$TODAY" ] || [ "$revision_date" = "$TODAY" ]; then
    if [ $DUE_COUNT -eq 0 ]; then
      printf "%-12s | %-50s | %-45s\n" "DATE" "DECISION" "RESULTAT ATTENDU"
      printf "%-12s-|-%-50s-|-%-45s\n" "------------" "--------------------------------------------------" "---------------------------------------------"
    fi

    date_col=$(echo "$line" | awk -F',' '{print $1}' | tr -d '"')
    decision_col=$(echo "$line" | awk -F',' '{print $2}' | tr -d '"')
    resultat_col=$(echo "$line" | awk -F',' '{print $4}' | tr -d '"')

    printf "%-12s | %-50s | %-45s\n" "$date_col" "$decision_col" "$resultat_col"
    DUE_COUNT=$((DUE_COUNT + 1))
  fi
done < <(tail -n +2 "$CSV_FILE")

echo ""
if [ $DUE_COUNT -eq 0 ]; then
  echo "Aucune decision a reviser aujourd'hui."
else
  echo ">>> $DUE_COUNT decision(s) a reviser ! <<<"
fi
echo "Total decisions dans le fichier : $TOTAL"
echo ""
