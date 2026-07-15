import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import { env } from '$env/dynamic/private';

export async function POST({ request }) {
    const { logs, eventContext } = await request.json();
    
    const apiKey = env.AI_SEARCH_API_KEY ?? env.OPENAI_API_KEY;
    if (!apiKey) {
        return json({ explanation: "AI Explainer unavailable: Missing API Key." });
    }
    
    const openai = new OpenAI({ apiKey });
    
    const prompt = `You are "Antigravity", the ClearSky AI Pipeline Explainer. 
Your job is to read the following internal execution logs from our 7-section signal processing pipeline and explain exactly what happened in a way a business owner or consultant can easily understand.

CONTEXT (Use as reference for author names/types, but DO NOT let this override the LOGS):
${JSON.stringify(eventContext)}

LOGS (Primary Source of Truth):
${logs.map((l: any) => `[${l.timestamp}] ${l.message} ${l.description || ''}`).join('\n')}

INSTRUCTIONS:
1. Summarize what the customer said/did based STRICTLY on the logs (specifically look at Section 1 and Section 4 log entries).
2. CRITICAL: If the logs show the customer talking about a specific topic (e.g. "order a pizza"), DO NOT summarize it as something else (e.g. "leaking roof"). Trust the LOGS over the CONTEXT if they conflict.
3. If the customer's name is not explicitly provided in the LOGS (e.g., author_name), DO NOT GUESS OR HALLUCINATE A NAME. Refer to them as "The Customer" or "The Caller".
4. Explain what the AI extracted (sentiment, urgency, topics) and why.
5. Explain which "Signal" was identified as dominant and why it was prioritized.
6. Explain the final actions taken (or blocked) and why.
7. If no public response was drafted, explain why (e.g. it was a private voice call, or it was an operational emergency).

Keep the tone professional, reassuring, and transparent. Use bullet points for readability. Avoid generic summaries if the logs provide specific details.`;

    try {
        const response = await openai.chat.completions.create({
            model: env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are the ClearSky AI Pipeline Explainer.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7
        });

        return json({ 
            explanation: response.choices[0].message.content 
        });
    } catch (err) {
        console.error('AI Explainer Error:', err);
        return json({ explanation: "Failed to generate AI explanation. Please check the logs manually." });
    }
}
