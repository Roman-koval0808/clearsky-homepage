#!/bin/bash
# ClearSky Diagnostic API Tests — Layer 1-12 Verification

API_URL="http://localhost:5173/api/diagnostic"

# Manito Plumbing & Heating Ltd Payload
PAYLOAD='{
    "business": {
        "name": "Manito Plumbing and Heating Ltd.",
        "city": "Timmins",
        "trade": "plumber",
        "websiteUrl": "https://manitoplumbing.ca/"
    },
    "revenue": {
        "annualRevenue": 1200000,
        "avgSaleValue": 3200,
        "missedCallsPerMonth": 20,
        "capacityUtilization": 0.75
    },
    "operations": {
        "yearsInBusiness": 14,
        "adminStaffCount": 1,
        "adminHoursPerWeek": 8,
        "marketTierOverride": null,
        "totalTechnicians": 3,
        "avgBillableHoursPerDay": 6,
        "workingDaysPerYear": 250
    }
}'

echo "======================================================"
echo "[REVENUE CALCULATOR] Running Layer 1-12 Diagnostic Test..."
echo "======================================================"

RESPONSE=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "$RESPONSE" | jq .

# Verification of Critical Metrics
echo "--- VERIFICATION ---"
REV=$(echo "$RESPONSE" | jq -r '.gaps.display.current')
if [ "$REV" == "$1.2M" ]; then echo "[PASS] Revenue Mapping: $REV"; else echo "[FAIL] Revenue Mapping: $REV"; fi

GBP_VAL=$(echo "$RESPONSE" | jq -r '.gaps.gbp')
if [ "$GBP_VAL" != "0" ]; then echo "[PASS] Layer 1 Gap: $GBP_VAL"; else echo "[FAIL] Layer 1 Gap is 0"; fi

SCENARIO_1=$(echo "$RESPONSE" | jq -r '.scenarios.current.display.mid')
if [ "$SCENARIO_1" != "$0" ]; then echo "[PASS] Scenario 1 Recovery: $SCENARIO_1"; else echo "[FAIL] Scenario 1 is 0"; fi
