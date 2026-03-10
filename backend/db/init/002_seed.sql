INSERT INTO profiles (name, description)
VALUES
  ('Business', 'Business-focused workflows and decision support'),
  ('Developer', 'Software engineering and technical product tasks'),
  ('Consultant', 'Client delivery, strategy, and communication workflows'),
  ('Student', 'Learning, studying, and knowledge synthesis'),
  ('Creator', 'Content, media, and audience growth workflows')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO tasks (name, description, category)
VALUES
  ('Analyze a PDF', 'Extract key insights from PDF files quickly', 'Document/PDF'),
  ('Summarize documents', 'Produce concise summaries from long material', 'Document/PDF'),
  ('Do research', 'Find and synthesize reliable information', 'Research'),
  ('Write content', 'Draft marketing, social, or long-form writing', 'Content Creation'),
  ('Create images', 'Generate and iterate visual assets', 'Content Creation'),
  ('Write code', 'Generate and improve code quickly', 'Coding'),
  ('Build an app', 'Plan and implement software products end-to-end', 'Coding'),
  ('Automate work', 'Create no-code or low-code automations', 'Automation')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = NOW();

INSERT INTO priorities (name, description)
VALUES
  ('Best quality', 'Prioritize output quality and reliability'),
  ('Fastest results', 'Get useful output as quickly as possible'),
  ('Easiest to use', 'Reduce complexity and learning curve'),
  ('Lowest price', 'Minimize recurring spend')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = NOW();

UPDATE tools
SET record_status = 'inactive',
    is_active = FALSE,
    updated_at = NOW();

INSERT INTO tools (
  tool_name,
  tool_slug,
  logo_url,
  best_for,
  website,
  referral_url,
  category,
  pricing,
  pricing_tier,
  ease_of_use,
  speed,
  quality,
  target_users,
  tags,
  context_word,
  record_status,
  is_active
)
VALUES
  ('ChatGPT', 'chatgpt', 'https://cdn.simpleicons.org/openai', 'General-purpose assistant with strong document and writing support', 'https://chatgpt.com', NULL, 'Document/PDF', 'Free + paid tiers', 'freemium', 5, 5, 5, '["Business","Developer","Consultant","Student","Creator"]'::jsonb, '["assistant","multimodal","documents"]'::jsonb, 'all-rounder', 'active', TRUE),
  ('Claude', 'claude', 'https://cdn.simpleicons.org/anthropic', 'Long-context reading and high-quality synthesis', 'https://claude.ai', NULL, 'Document/PDF', 'Free + paid tiers', 'freemium', 4, 4, 5, '["Business","Consultant","Student","Creator"]'::jsonb, '["long-context","analysis"]'::jsonb, 'long context', 'active', TRUE),
  ('NotebookLM', 'notebooklm', 'https://notebooklm.google.com/favicon.ico', 'Research notebooks grounded in your uploaded sources', 'https://notebooklm.google.com', NULL, 'Document/PDF', 'Included with Google account', 'free', 4, 4, 4, '["Student","Consultant","Business"]'::jsonb, '["pdf","study","sources"]'::jsonb, 'source-grounded', 'active', TRUE),
  ('Adobe Acrobat AI Assistant', 'adobe-acrobat-ai-assistant', 'https://acrobat.adobe.com/favicon.ico', 'Enterprise-friendly PDF workflows and summaries', 'https://acrobat.adobe.com', NULL, 'Document/PDF', 'Adobe paid plans', 'paid_mid', 4, 3, 4, '["Business","Consultant"]'::jsonb, '["pdf","enterprise"]'::jsonb, 'pdf native', 'active', TRUE),
  ('Humata', 'humata', 'https://www.humata.ai/favicon.ico', 'Ask questions against large documents quickly', 'https://www.humata.ai', NULL, 'Document/PDF', 'Free + paid tiers', 'freemium', 4, 4, 4, '["Student","Consultant","Business"]'::jsonb, '["pdf","q&a"]'::jsonb, 'doc chat', 'active', TRUE),

  ('Perplexity', 'perplexity', 'https://cdn.simpleicons.org/perplexity', 'Fast source-cited answers for research tasks', 'https://www.perplexity.ai', NULL, 'Research', 'Free + Pro', 'freemium', 5, 5, 4, '["Business","Student","Consultant","Developer"]'::jsonb, '["research","citations"]'::jsonb, 'cited answers', 'active', TRUE),
  ('Elicit', 'elicit', 'https://elicit.com/favicon.ico', 'Research synthesis for papers and evidence review', 'https://elicit.com', NULL, 'Research', 'Free + paid plans', 'freemium', 4, 3, 5, '["Student","Consultant"]'::jsonb, '["papers","evidence"]'::jsonb, 'evidence', 'active', TRUE),
  ('Consensus', 'consensus', 'https://consensus.app/favicon.ico', 'Academic search focused on scientific papers', 'https://consensus.app', NULL, 'Research', 'Free + paid plans', 'freemium', 4, 4, 5, '["Student","Consultant"]'::jsonb, '["science","papers"]'::jsonb, 'science first', 'active', TRUE),
  ('You.com', 'you-com', 'https://you.com/favicon.ico', 'Web research with built-in assistant workflows', 'https://you.com', NULL, 'Research', 'Free + paid plans', 'freemium', 4, 5, 4, '["Business","Student","Developer"]'::jsonb, '["web-search","assistant"]'::jsonb, 'web focus', 'active', TRUE),
  ('Scite', 'scite', 'https://scite.ai/favicon.ico', 'Citation-context analysis for literature validation', 'https://scite.ai', NULL, 'Research', 'Paid plans', 'paid_low', 3, 3, 5, '["Student","Consultant"]'::jsonb, '["citations","validation"]'::jsonb, 'citation context', 'active', TRUE),

  ('Jasper', 'jasper', 'https://www.jasper.ai/favicon.ico', 'Marketing-oriented long-form and campaign content', 'https://www.jasper.ai', NULL, 'Content Creation', 'Paid plans', 'paid_mid', 4, 4, 4, '["Business","Creator","Consultant"]'::jsonb, '["marketing","copywriting"]'::jsonb, 'marketing copy', 'active', TRUE),
  ('Copy.ai', 'copy-ai', 'https://www.copy.ai/favicon.ico', 'Quick campaign drafting and content ideation', 'https://www.copy.ai', NULL, 'Content Creation', 'Free + paid tiers', 'freemium', 5, 5, 4, '["Business","Creator","Consultant"]'::jsonb, '["copy","campaigns"]'::jsonb, 'campaign speed', 'active', TRUE),
  ('Canva Magic Write', 'canva-magic-write', 'https://www.canva.com/favicon.ico', 'Design and writing workflows in one place', 'https://www.canva.com', NULL, 'Content Creation', 'Free + paid tiers', 'freemium', 5, 4, 4, '["Creator","Business","Student"]'::jsonb, '["design","content"]'::jsonb, 'design native', 'active', TRUE),
  ('Notion AI', 'notion-ai', 'https://www.notion.so/images/favicon.ico', 'Structured writing and workspace content organization', 'https://www.notion.so/product/ai', NULL, 'Content Creation', 'Paid add-on', 'paid_low', 4, 4, 4, '["Business","Consultant","Student"]'::jsonb, '["workspace","writing"]'::jsonb, 'workspace', 'active', TRUE),
  ('Grammarly', 'grammarly', 'https://www.grammarly.com/favicon.ico', 'Polish tone, clarity, and grammar for final drafts', 'https://www.grammarly.com', NULL, 'Content Creation', 'Free + paid tiers', 'freemium', 5, 5, 4, '["Business","Student","Consultant","Creator"]'::jsonb, '["editing","clarity"]'::jsonb, 'editing', 'active', TRUE),

  ('Cursor', 'cursor', 'https://www.cursor.com/favicon.ico', 'AI-native IDE for full project development', 'https://www.cursor.com', 'https://www.cursor.com', 'Coding', 'Paid subscription', 'paid_low', 4, 5, 5, '["Developer","Founder"]'::jsonb, '["coding","ide"]'::jsonb, 'ide native', 'active', TRUE),
  ('GitHub Copilot', 'github-copilot', 'https://github.com/favicon.ico', 'In-editor coding acceleration with strong completions', 'https://github.com/features/copilot', NULL, 'Coding', 'Paid plans', 'paid_low', 5, 5, 4, '["Developer","Founder"]'::jsonb, '["ide","autocomplete"]'::jsonb, 'autocomplete', 'active', TRUE),
  ('Replit AI', 'replit-ai', 'https://replit.com/public/icons/favicon-prompt-192.png', 'Browser-based coding with fast setup', 'https://replit.com', NULL, 'Coding', 'Free + paid tiers', 'freemium', 5, 4, 4, '["Developer","Student","Founder"]'::jsonb, '["browser-ide","coding"]'::jsonb, 'browser IDE', 'active', TRUE),
  ('Codeium', 'codeium', 'https://codeium.com/favicon.ico', 'Low-cost coding assistant across popular editors', 'https://codeium.com', NULL, 'Coding', 'Free + paid plans', 'freemium', 4, 5, 4, '["Developer","Student"]'::jsonb, '["assistant","editor"]'::jsonb, 'free tier', 'active', TRUE),
  ('Tabnine', 'tabnine', 'https://www.tabnine.com/favicon.ico', 'Private AI code completion for teams', 'https://www.tabnine.com', NULL, 'Coding', 'Paid plans', 'paid_mid', 4, 4, 4, '["Developer","Business"]'::jsonb, '["code-completion","privacy"]'::jsonb, 'private model', 'active', TRUE),

  ('Zapier', 'zapier', 'https://zapier.com/favicon.ico', 'No-code automations with broad app integrations', 'https://zapier.com', NULL, 'Automation', 'Free + paid tiers', 'freemium', 5, 5, 4, '["Business","Consultant","Creator"]'::jsonb, '["automation","integrations"]'::jsonb, 'easy setup', 'active', TRUE),
  ('Make', 'make', 'https://www.make.com/favicon.ico', 'Visual workflow design for complex automation chains', 'https://www.make.com', NULL, 'Automation', 'Free + paid tiers', 'freemium', 4, 4, 4, '["Business","Consultant","Developer"]'::jsonb, '["visual automation","workflows"]'::jsonb, 'visual builder', 'active', TRUE),
  ('n8n', 'n8n', 'https://n8n.io/favicon.ico', 'Flexible automation with strong self-hosting option', 'https://n8n.io', NULL, 'Automation', 'Self-hosted + cloud', 'free', 3, 4, 4, '["Developer","Business"]'::jsonb, '["open-source","automation"]'::jsonb, 'open source', 'active', TRUE),
  ('Airtable Automations', 'airtable-automations', 'https://www.airtable.com/favicon.ico', 'Database-native automation and notifications', 'https://www.airtable.com', NULL, 'Automation', 'Free + paid tiers', 'freemium', 4, 4, 4, '["Business","Consultant"]'::jsonb, '["database","automation"]'::jsonb, 'database native', 'active', TRUE),
  ('Microsoft Power Automate', 'microsoft-power-automate', 'https://powerautomate.microsoft.com/favicon.ico', 'Automation inside Microsoft ecosystem and enterprise stack', 'https://powerautomate.microsoft.com', NULL, 'Automation', 'Included + paid plans', 'paid_mid', 4, 4, 4, '["Business","Consultant"]'::jsonb, '["microsoft","automation"]'::jsonb, 'Microsoft stack', 'active', TRUE)
ON CONFLICT (tool_slug) DO UPDATE SET
  tool_name = EXCLUDED.tool_name,
  logo_url = EXCLUDED.logo_url,
  best_for = EXCLUDED.best_for,
  website = EXCLUDED.website,
  referral_url = EXCLUDED.referral_url,
  category = EXCLUDED.category,
  pricing = EXCLUDED.pricing,
  pricing_tier = EXCLUDED.pricing_tier,
  ease_of_use = EXCLUDED.ease_of_use,
  speed = EXCLUDED.speed,
  quality = EXCLUDED.quality,
  target_users = EXCLUDED.target_users,
  tags = EXCLUDED.tags,
  context_word = EXCLUDED.context_word,
  record_status = EXCLUDED.record_status,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
