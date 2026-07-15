/**
 * DataForSEO Postback Simulator
 * 
 * Run this to simulate a live review arriving from DataForSEO.
 */

async function simulate() {
    const payload = {
        "tasks": [
            {
                "id": "06031430-1535-0139-0000-843867809a34",
                "status_code": 20000,
                "result": [
                    {
                        "location_id": "gbp_location_1199",
                        "items": [
                            {
                                "type": "google_business_profile_review",
                                "review_id": "gbp_review_live_" + Date.now(),
                                "rating": {
                                    "value": 5
                                },
                                "text": "Live review test via DataForSEO Bridge! The team at Apex Contracting is incredible.",
                                "author_name": "James T. Kirk",
                                "timestamp": new Date().toISOString()
                            }
                        ]
                    }
                ]
            }
        ]
    };

    console.log("🚀 Sending DataForSEO Postback simulation...");
    
    try {
        const response = await fetch("http://localhost:5173/api/signals/google/review/postback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log("✅ Result:", JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("❌ Error:", err.message);
        console.log("Note: Make sure the SvelteKit dev server is running on http://localhost:5173");
    }
}

simulate();
