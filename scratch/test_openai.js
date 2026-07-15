// No import needed for fetch in Node 22+

const apiKey = "sk-proj-rRof48Y_aFp3j9F879-xLp25G3Nq5n9y6j5j5j5j5j5j5j5j"; // truncated for example, but I'll use the one from .env

const SYSTEM_PROMPT = `You are a ContentRadar signal scorer for family law firms.
Score signals strictly on a 0-3 scale based on the provided criteria.
Respond ONLY with valid JSON: {"score": 0, "note": "one sentence under 20 words"}.`;

const prompt = 'Score 0-3: Can a first-time visitor identify what the firm does, who they serve, where they operate, and what makes them different within 5 seconds?';
const content = 'Suzanne Desrosiers Professional Corporation is a law firm in Timmins, Ontario. We specialize in family law, employment law, and wills and estates. We have been serving the community for over 26 years.';

async function test() {
    console.log("Testing OpenAI with hardcoded content...");
    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.AI_SEARCH_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                max_tokens: 200,
                response_format: { type: "json_object" },
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { 
                        role: 'user', 
                        content: `${prompt}\n\nPage content:\n${content}` 
                    }
                ]
            })
        });

        const data = await res.json();
        console.log("Status:", res.status);
        if (data.error) {
            console.error("Error:", data.error);
        } else {
            console.log("Response:", data.choices[0].message.content);
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

test();
