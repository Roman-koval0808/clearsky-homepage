You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

## ClearSky AI Decision System Pipeline

### Section 1: Event Intake & AI Extraction
- Normalizes raw data from providers (Google, Telnyx, etc.)
- Performs AI extraction via `performAiExtraction` to identify sentiment, topics, and urgency.

### Section 2: Signal Detection (Deterministic Rules)
- Evaluates enriched events against `SignalRules`.
- Creates `Signal` candidates in the database.

### Section 3: Orchestrator Decision (Deterministic Rules)
- **Purpose**: Determines what actions to take based on active signals.
- **Steps**:
    1. Rank signal candidates (Risk > Bottleneck > Opportunity).
    2. Identify Dominant Signal.
    3. Apply suppression rules to supporting signals.
    4. Map Signals to Action Library IDs.
    5. Resolve execution mode (Automatic vs Approval Required) based on client profile, consultant ownership, and domain.
    6. Apply non-negotiable Safety Rules (Final Override).
    7. Write auditable `OrchestratorDecision` record.
- **Key Tables**: `orchestrator_decisions`, `action_library`, `safety_compliance_rules`, `signal_action_mappings`.

## Development Commands
- `npm run db:seed`: Seeds the database with Orchestrator test data (APEX Contracting, Sarah Jenkins).
