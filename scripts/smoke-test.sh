#!/bin/bash
# ============================================
# ECHO — Smoke Test Script (post-deployment)
# Usage: ./scripts/smoke-test.sh [API_BASE_URL]
# Default: https://api.mouvementecho.fr/api
# ============================================

API_URL="${1:-https://api.mouvementecho.fr/api}"
PASS=0
FAIL=0
TOTAL=0

check() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    TOTAL=$((TOTAL + 1))

    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$url")

    if [ "$status" = "$expected_status" ]; then
        echo "  ✅ $name — HTTP $status"
        PASS=$((PASS + 1))
    else
        echo "  ❌ $name — HTTP $status (expected $expected_status)"
        FAIL=$((FAIL + 1))
    fi
}

echo ""
echo "🔍 ECHO Smoke Test — $API_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📡 API Endpoints:"
check "Partners (public list)"     "$API_URL/partners"
check "Events (public list)"       "$API_URL/events"
check "Episodes (public list)"     "$API_URL/episodes"
check "Mediatheque (public list)"  "$API_URL/mediatheque"
check "Analytics stats (public)"   "$API_URL/analytics/stats/public"
check "Partners stats"             "$API_URL/partners/stats"
check "Partners thematics"         "$API_URL/partners/thematics"

echo ""
echo "🔒 Auth (should return 401):"
check "Auth /me (no token)"        "$API_URL/auth/me" "401"

echo ""
echo "🛡️ Admin (should return 401):"
check "Admin pending (no token)"   "$API_URL/admin/pending" "401"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Results: $PASS/$TOTAL passed, $FAIL failed"
echo ""

if [ "$FAIL" -gt 0 ]; then
    echo "⚠️  SMOKE TEST FAILED — $FAIL endpoint(s) down"
    exit 1
else
    echo "✅ ALL SMOKE TESTS PASSED"
    exit 0
fi
