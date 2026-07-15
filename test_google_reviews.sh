#!/bin/bash

# ClearSky Google Review Test Suite
# Use these commands to simulate different customer feedback scenarios.
# Note: Ensure your local server is running (usually http://localhost:5173)

URL="http://localhost:5173/api/signals/google/review"

echo "🚀 Starting Google Review Simulations..."

# 1. POSITIVE 5-STAR (Reputation Momentum)
echo "Sending Scenario 1: The Raving Fan..."
curl -X POST $URL \
     -H "Content-Type: application/json" \
     -d '{
      "review_id": "gbp_rev_pos_'$(date +%s)'",
      "location_id": "gbp_location_1199",
      "author_name": "John Doe",
      "rating": 5,
      "comment": "Absolutely incredible service! The team replaced my entire roof in two days. Cleaned up everything. Best contractor in Timmins.",
      "created_time": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
     }'
echo -e "\n"

# 2. NEGATIVE 1-STAR (Critical Risk / Intervention)
echo "Sending Scenario 2: The Emergency Leak..."
curl -X POST $URL \
     -H "Content-Type: application/json" \
     -d '{
      "review_id": "gbp_rev_neg_'$(date +%s)'",
      "location_id": "gbp_location_1199",
      "author_name": "Margaret T.",
      "rating": 1,
      "comment": "Emergency! My roof is leaking after the repair they did last week. I have called 5 times and no one answers. Water is coming into my kitchen right now!",
      "created_time": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
     }'
echo -e "\n"

# 3. MIXED 4-STAR (Communication Bottleneck)
echo "Sending Scenario 3: The Mixed Feedback..."
curl -X POST $URL \
     -H "Content-Type: application/json" \
     -d '{
      "review_id": "gbp_rev_mixed_'$(date +%s)'",
      "location_id": "gbp_location_1199",
      "author_name": "Sarah M.",
      "rating": 4,
      "comment": "The crew was professional and the job looks good. Only reason I’m giving 4 stars is because communication before the appointment was a little slow.",
      "created_time": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
     }'
echo -e "\n"

# 4. NEW LEAD OPPORTUNITY (Growth Signal)
echo "Sending Scenario 4: The Repeat Business Lead..."
curl -X POST $URL \
     -H "Content-Type: application/json" \
     -d '{
      "review_id": "gbp_rev_lead_'$(date +%s)'",
      "location_id": "gbp_location_1199",
      "author_name": "Robert K.",
      "rating": 5,
      "comment": "Roof looks great. I was wondering if you guys also do window replacements? Please give me a call to discuss a quote for my next project.",
      "created_time": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
     }'
echo -e "\n"

# 5. ANGRY NEIGHBOR (Operations/Brand Risk)
echo "Sending Scenario 5: The Parking Complaint..."
curl -X POST $URL \
     -H "Content-Type: application/json" \
     -d '{
      "provider": "google_business_profile",
      "provider_event_name": "review.created",
      "review_id": "gbp_rev_ops_'$(date +%s)'",
      "location_id": "gbp_location_1199",
      "author_name": "Alex P.",
      "rating": 2,
      "comment": "I am not even a customer. Your trucks blocked my driveway for 3 hours while you were working next door. Very inconsiderate drivers.",
      "created_time": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
     }'
echo -e "\n"

echo "✅ Simulations Complete. Check the AI Signals Dashboard!"
