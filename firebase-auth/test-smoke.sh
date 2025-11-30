#!/usr/bin/env bash
# Smoke test simple — vérifie que index.html contient la ligne d'en-tête
set -euo pipefail
URL="http://127.0.0.1:8000/firebase-auth/index.html"

STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 5 $URL || echo "000")
if [[ "$STATUS" != "200" ]]; then
  echo "ERREUR: $URL returned status $STATUS"
  exit 2
fi

# Verify page content
CONTENT=$(curl -sS --max-time 5 "$URL")
if ! echo "$CONTENT" | grep -q "Créer un compte"; then
  echo "ERREUR: page does not contain expected string"
  exit 3
fi

echo "OK: $URL returned 200 and contains expected text"