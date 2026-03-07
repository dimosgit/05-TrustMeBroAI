INSERT INTO profiles (name, description)
VALUES
  ('Business', 'Business-focused workflows and decision support'),
  ('Developer', 'Software engineering and technical product tasks'),
  ('Consultant', 'Client delivery, strategy, and communication workflows'),
  ('Student', 'Learning, studying, and knowledge synthesis'),
  ('Creator', 'Content, media, and audience growth workflows')
ON CONFLICT (name) DO NOTHING;

INSERT INTO tasks (name, description, category)
VALUES
  ('Analyze a PDF', 'Extract key insights from PDF files quickly', 'analysis'),
  ('Write content', 'Draft marketing, social, or long-form writing', 'content'),
  ('Summarize documents', 'Produce concise summaries from long material', 'analysis'),
  ('Write code', 'Generate and improve code quickly', 'development'),
  ('Build an app', 'Plan and implement software products end-to-end', 'development'),
  ('Automate work', 'Create no-code or low-code automations', 'automation'),
  ('Do research', 'Find and synthesize reliable information', 'research'),
  ('Create images', 'Generate and iterate visual assets', 'creative')
ON CONFLICT (name) DO NOTHING;

INSERT INTO priorities (name, description)
VALUES
  ('Lowest price', 'Minimize recurring spend'),
  ('Best quality', 'Prioritize output quality and reliability'),
  ('Fastest results', 'Get useful output as quickly as possible'),
  ('Easiest to use', 'Reduce complexity and learning curve'),
  ('Beginner friendly', 'Accessible setup and simple workflows'),
  ('Privacy', 'Prefer stronger privacy and controlled data usage')
ON CONFLICT (name) DO NOTHING;

INSERT INTO tools (
  name,
  category,
  pricing_type,
  pricing_label,
  website_url,
  description,
  strengths,
  weaknesses,
  is_active
)
VALUES
  (
    'ChatGPT',
    'assistant',
    'freemium',
    'Free + paid tiers',
    'https://chatgpt.com',
    'General-purpose AI assistant with strong multimodal capabilities.',
    '["Versatile", "Fast responses", "Strong ecosystem"]'::jsonb,
    '["Can require prompt tuning"]'::jsonb,
    TRUE
  ),
  (
    'Claude',
    'assistant',
    'freemium',
    'Free + paid tiers',
    'https://claude.ai',
    'AI assistant optimized for long context and thoughtful writing.',
    '["Long context", "Strong writing quality"]'::jsonb,
    '["Smaller plugin ecosystem"]'::jsonb,
    TRUE
  ),
  (
    'Microsoft Copilot',
    'assistant',
    'freemium',
    'Free + Microsoft plans',
    'https://copilot.microsoft.com',
    'Microsoft-integrated assistant for office and productivity use cases.',
    '["Microsoft integration", "Productivity workflows"]'::jsonb,
    '["Best inside Microsoft stack"]'::jsonb,
    TRUE
  ),
  (
    'Perplexity',
    'research',
    'freemium',
    'Free + Pro',
    'https://www.perplexity.ai',
    'AI answer engine focused on research and source-grounded responses.',
    '["Research speed", "Source citations"]'::jsonb,
    '["Less suited for coding-heavy tasks"]'::jsonb,
    TRUE
  ),
  (
    'Cursor',
    'development',
    'paid',
    'Pro subscription',
    'https://www.cursor.com',
    'AI-native code editor designed for fast implementation workflows.',
    '["Codebase-aware assistance", "Developer speed"]'::jsonb,
    '["Primarily developer-focused"]'::jsonb,
    TRUE
  ),
  (
    'GitHub Copilot',
    'development',
    'paid',
    'Individual + business plans',
    'https://github.com/features/copilot',
    'AI coding assistant deeply integrated with IDEs and GitHub workflows.',
    '["IDE integration", "Code completion quality"]'::jsonb,
    '["Most value in coding contexts"]'::jsonb,
    TRUE
  ),
  (
    'Zapier',
    'automation',
    'freemium',
    'Free + tiered paid plans',
    'https://zapier.com',
    'No-code automation platform with extensive app integrations.',
    '["Ease of use", "Large integration library"]'::jsonb,
    '["Costs can grow with usage"]'::jsonb,
    TRUE
  ),
  (
    'Make',
    'automation',
    'freemium',
    'Free + tiered paid plans',
    'https://www.make.com',
    'Visual automation builder for advanced multi-step workflows.',
    '["Visual scenario builder", "Flexible logic"]'::jsonb,
    '["Slightly steeper learning curve"]'::jsonb,
    TRUE
  ),
  (
    'n8n',
    'automation',
    'open-source',
    'Self-hosted free + cloud plans',
    'https://n8n.io',
    'Workflow automation platform with strong self-hosted flexibility.',
    '["Self-hosted control", "High customization"]'::jsonb,
    '["Requires more technical setup"]'::jsonb,
    TRUE
  )
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  pricing_type = EXCLUDED.pricing_type,
  pricing_label = EXCLUDED.pricing_label,
  website_url = EXCLUDED.website_url,
  description = EXCLUDED.description,
  strengths = EXCLUDED.strengths,
  weaknesses = EXCLUDED.weaknesses,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
