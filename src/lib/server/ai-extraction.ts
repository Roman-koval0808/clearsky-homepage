import OpenAI from 'openai';
import { env } from '$env/dynamic/private';
import { z } from 'zod';

const ExtractionResultSchema = z.object({
	contains_problem: z.boolean().describe("True if the customer mentions a specific issue, complaint, or problem with service."),
	contains_quote_request: z.boolean().describe("True if the customer is asking for a price, quote, estimate, or bid."),
	contains_callback_request: z.boolean().describe("True if the customer explicitly asks to be called back or contacted via phone."),
	contains_emergency_keywords: z.boolean().describe("True if keywords like 'leak', 'flood', 'no power', 'dangerous', 'emergency' are present."),
	requested_contact_method: z.enum(['phone', 'email', 'text', 'none']).describe("The preferred contact method mentioned by the customer."),
	requested_action: z.string().describe("The primary action requested by the customer (e.g., 'phone_call', 'send_quote', 'complaint_resolution')."),
	detected_keywords: z.array(z.string()).describe("A list of relevant technical or business keywords found in the text."),
	
	service_requested: z.string().describe("The specific service mentioned (e.g., 'roof repair', 'electrical')."),
	sentiment: z.enum(['positive', 'neutral', 'negative']),
	praise_topics: z.array(z.string()),
	complaint_topics: z.array(z.string()),
	summary: z.string(),
	confidence_score: z.number().min(0).max(1),
	
	// Deprecated/Legacy (mapping for compatibility)
	urgency_level: z.enum(['low', 'medium', 'high']).describe("DEPRECATED: Use booleans for decision logic. For extraction, set 'high' only if multiple urgency booleans are true.")
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

let _openai: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
	const apiKey = env.AI_SEARCH_API_KEY ?? env.OPENAI_API_KEY;
	if (!apiKey) throw new Error('Missing AI_SEARCH_API_KEY');
	if (_openai) return _openai;
	_openai = new OpenAI({ apiKey, timeout: 12000, maxRetries: 0 });
	return _openai;
}

export const AI_EXTRACTION_PROTOCOL = {
    name: 'clearsky_extraction',
    description: 'Semantic parser for home services business facts.',
    fields_to_extract: {
        contains_problem: "boolean (True if issue/complaint mentioned)",
        contains_quote_request: "boolean (True if asking for price/estimate)",
        contains_callback_request: "boolean (True if explicitly asking for a phone call back)",
        contains_emergency_keywords: "boolean (True if words like leak, flood, dangerous present)",
        requested_contact_method: "string (phone, email, text, or none)",
        requested_action: "string (phone_call, send_quote, info_request, etc)",
        detected_keywords: "array (quote, call, leak, pricing, etc)",
        service_requested: "string (specific service mentioned)",
        sentiment: "string (positive, neutral, negative)",
        praise_topics: "array (concise praise phrases)",
        complaint_topics: "array (concise complaint phrases)",
        summary: "string (one-sentence summary)",
        confidence_score: "number (0 to 1)"
    }
};

export async function performAiExtraction(text: string): Promise<ExtractionResult & { _protocol?: any }> {
    const openai = getOpenAIClient();
    const systemPrompt = `You are a semantic parser for a home services business. Your job is to extract raw facts from customer messages (SMS, reviews, voicemails).
            
Do NOT make business decisions. Do NOT decide if something is 'Critical' or 'Important'. 
Instead, return specific booleans and factual fields based on the content of the message.

Fields:
- contains_problem: Is there a complaint or issue mentioned?
- contains_quote_request: Is the customer asking for pricing or an estimate?
- contains_callback_request: Does the customer want a phone call back?
- contains_emergency_keywords: Does the text contain words like leak, flood, dangerous, emergency, broken, fire, etc?
- requested_contact_method: What specific contact method did they ask for?
- requested_action: What is the single most important action the customer wants us to take?
- detected_keywords: List all important nouns/verbs related to business (e.g. quote, call, roof, leak, pricing). If the user mentions their name, include it here.

For 'complaint_topics' and 'praise_topics': Use concise phrases. 
CRITICAL: If the communication mentions ANY safety concerns or dangerous behavior, include 'safety_violation' in complaint_topics.

Urgency mapping (Internal hint): 
Set urgency_level to 'high' ONLY if contains_emergency_keywords is true OR (contains_quote_request is true AND contains_callback_request is true).`;

    const response = await openai.responses.parse({
        model: env.OPENAI_MODEL || 'gpt-4o-mini',
        input: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
        ],
        temperature: 0,
        text: {
            format: {
                type: 'json_schema',
                name: AI_EXTRACTION_PROTOCOL.name,
                strict: true,
                schema: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['contains_problem', 'contains_quote_request', 'contains_callback_request', 'contains_emergency_keywords', 'requested_contact_method', 'requested_action', 'detected_keywords', 'service_requested', 'sentiment', 'praise_topics', 'complaint_topics', 'summary', 'confidence_score', 'urgency_level'],
                    properties: {
                        contains_problem: { type: 'boolean' },
                        contains_quote_request: { type: 'boolean' },
                        contains_callback_request: { type: 'boolean' },
                        contains_emergency_keywords: { type: 'boolean' },
                        requested_contact_method: { type: 'string', enum: ['phone', 'email', 'text', 'none'] },
                        requested_action: { type: 'string' },
                        detected_keywords: { type: 'array', items: { type: 'string' } },
                        service_requested: { type: 'string' },
                        sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
                        praise_topics: { type: 'array', items: { type: 'string' } },
                        complaint_topics: { type: 'array', items: { type: 'string' } },
                        summary: { type: 'string' },
                        confidence_score: { type: 'number' },
                        urgency_level: { type: 'string', enum: ['low', 'medium', 'high'] }
                    }
                }
            }
        }
    });

    const parsed = ExtractionResultSchema.parse((response as any).output_parsed);
    
    return {
        ...parsed,
        _protocol: {
            message: text,
            fields_to_extract: AI_EXTRACTION_PROTOCOL.fields_to_extract,
            raw_response: (response as any).output_parsed
        }
    };
}
