const fs = require('fs');

function fixBlog(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Inject the ContentRadar submitter function
    if (!content.includes('submitToContentRadar')) {
        content = content.replace('<script>', `<script>
async function submitToContentRadar(text, formId) {
    await fetch('/hub/contentradar/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            question_text: text,
            source_page: window.location.pathname,
            source_form: formId,
            timestamp: new Date().toISOString(),
            session_id: _sessionId
        })
    });
}
`);
    }

    // Update submitQuestion (blog hero form)
    content = content.replace(/function submitQuestion\(\)\s*\{([^}]*?)const q\s*=\s*document\.getElementById\('qText'\)\.value;([^}]*?)firePixel\(([^}]*?)\);/s,
    `function submitQuestion() {$1const q = document.getElementById('qText').value;$2firePixel($3);\n  if(q.trim()) submitToContentRadar(q.trim(), 'hero');`);

    // Update submitPostQuestion
    content = content.replace(/function submitPostQuestion\(\)\s*\{([^}]*?)const q\s*=\s*document\.getElementById\('postQText'\)\.value;([^}]*?)firePixel\(([^}]*?)\);/s,
    `function submitPostQuestion() {$1const q = document.getElementById('postQText').value;$2firePixel($3);\n  if(q.trim()) submitToContentRadar(q.trim(), 'per_post');`);

    // Update submitSidebarQuestion (inject after pixel call)
    content = content.replace(/(function submitSidebarQuestion\(\)[\s\S]*?firePixel\([^)]*\);)/s,
    `$1\n  if(q.trim()) submitToContentRadar(q.trim(), 'sidebar');`);

    fs.writeFileSync(filePath, content);
    console.log("Fixed blog");
}

function fixFaq(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (!content.includes('submitToContentRadar')) {
        content = content.replace('<script>', `<script>
async function submitToContentRadar(text, formId) {
    await fetch('/hub/contentradar/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            question_text: text,
            source_page: window.location.pathname,
            source_form: formId,
            timestamp: new Date().toISOString(),
            session_id: _sessionId
        })
    });
}
`);
    }

    // Update submitStillQ (FAQ sidebar form)
    content = content.replace(/function submitStillQ\(\)\s*\{([^}]*?)const q\s*=\s*document\.getElementById\('stillQ'\)\.value;([^}]*?)firePixel\(([^}]*?)\);/s,
    `function submitStillQ() {$1const q = document.getElementById('stillQ').value;$2firePixel($3);\n  if(q.trim()) submitToContentRadar(q.trim(), 'still_have_question');`);

    fs.writeFileSync(filePath, content);
    console.log("Fixed faq");
}

fixBlog('static/marketing-automation/RightFlush/rightflush-blog (2).html');
fixFaq('static/marketing-automation/RightFlush/rightflush-faq (2).html');

