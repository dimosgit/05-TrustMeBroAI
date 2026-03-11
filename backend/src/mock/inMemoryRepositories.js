function now() {
  return new Date();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function baseData() {
  return {
    profiles: [
      { id: 1, name: "Business", description: "Business-focused workflows" },
      { id: 2, name: "Developer", description: "Developer workflows" },
      { id: 3, name: "Consultant", description: "Consulting workflows" },
      { id: 4, name: "Student", description: "Learning workflows" },
      { id: 5, name: "Creator", description: "Content workflows" }
    ],
    tasks: [
      { id: 1, name: "Analyze a PDF", description: "Analyze PDFs", category: "Document/PDF" },
      { id: 2, name: "Do research", description: "Research", category: "Research" },
      { id: 3, name: "Write content", description: "Write content", category: "Content Creation" },
      { id: 4, name: "Write code", description: "Coding", category: "Coding" },
      { id: 5, name: "Automate work", description: "Automation", category: "Automation" }
    ],
    priorities: [
      { id: 1, name: "Best quality", description: "Quality first" },
      { id: 2, name: "Fastest results", description: "Speed first" },
      { id: 3, name: "Easiest to use", description: "Ease first" },
      { id: 4, name: "Lowest price", description: "Price first" }
    ],
    tools: [
      {
        id: 1,
        tool_name: "ChatGPT",
        tool_slug: "chatgpt",
        logo_url: "https://cdn.simpleicons.org/openai",
        best_for: "General-purpose assistant",
        website: "https://chatgpt.com",
        referral_url: null,
        category: "Document/PDF",
        pricing: "Free + paid",
        pricing_tier: "freemium",
        ease_of_use: 5,
        speed: 5,
        quality: 5,
        target_users: ["Business", "Developer", "Consultant", "Student", "Creator"],
        tags: ["assistant"],
        context_word: "all-rounder",
        record_status: "active"
      },
      {
        id: 2,
        tool_name: "Claude",
        tool_slug: "claude",
        logo_url: "https://cdn.simpleicons.org/anthropic",
        best_for: "Long-context reading and synthesis",
        website: "https://claude.ai",
        referral_url: null,
        category: "Document/PDF",
        pricing: "Free + paid",
        pricing_tier: "freemium",
        ease_of_use: 4,
        speed: 4,
        quality: 5,
        target_users: ["Business", "Consultant", "Student", "Creator"],
        tags: ["analysis"],
        context_word: "long context",
        record_status: "active"
      },
      {
        id: 3,
        tool_name: "Perplexity",
        tool_slug: "perplexity",
        logo_url: "https://cdn.simpleicons.org/perplexity",
        best_for: "Source-cited answers",
        website: "https://www.perplexity.ai",
        referral_url: null,
        category: "Research",
        pricing: "Free + Pro",
        pricing_tier: "freemium",
        ease_of_use: 5,
        speed: 5,
        quality: 4,
        target_users: ["Business", "Student", "Consultant", "Developer"],
        tags: ["research"],
        context_word: "cited answers",
        record_status: "active"
      },
      {
        id: 4,
        tool_name: "Elicit",
        tool_slug: "elicit",
        logo_url: "https://elicit.com/favicon.ico",
        best_for: "Evidence synthesis",
        website: "https://elicit.com",
        referral_url: null,
        category: "Research",
        pricing: "Free + paid",
        pricing_tier: "freemium",
        ease_of_use: 4,
        speed: 3,
        quality: 5,
        target_users: ["Student", "Consultant"],
        tags: ["research"],
        context_word: "evidence",
        record_status: "active"
      },
      {
        id: 5,
        tool_name: "Copy.ai",
        tool_slug: "copy-ai",
        logo_url: "https://www.copy.ai/favicon.ico",
        best_for: "Fast campaign drafting",
        website: "https://www.copy.ai",
        referral_url: null,
        category: "Content Creation",
        pricing: "Free + paid",
        pricing_tier: "freemium",
        ease_of_use: 5,
        speed: 5,
        quality: 4,
        target_users: ["Business", "Creator", "Consultant"],
        tags: ["content"],
        context_word: "campaign speed",
        record_status: "active"
      },
      {
        id: 6,
        tool_name: "Jasper",
        tool_slug: "jasper",
        logo_url: "https://www.jasper.ai/favicon.ico",
        best_for: "Marketing content",
        website: "https://www.jasper.ai",
        referral_url: null,
        category: "Content Creation",
        pricing: "Paid",
        pricing_tier: "paid_mid",
        ease_of_use: 4,
        speed: 4,
        quality: 4,
        target_users: ["Business", "Creator", "Consultant"],
        tags: ["content"],
        context_word: "marketing copy",
        record_status: "active"
      },
      {
        id: 7,
        tool_name: "Cursor",
        tool_slug: "cursor",
        logo_url: "https://www.cursor.com/favicon.ico",
        best_for: "AI-native coding IDE",
        website: "https://www.cursor.com",
        referral_url: "https://www.cursor.com",
        category: "Coding",
        pricing: "Paid",
        pricing_tier: "paid_low",
        ease_of_use: 4,
        speed: 5,
        quality: 5,
        target_users: ["Developer"],
        tags: ["coding"],
        context_word: "ide native",
        record_status: "active"
      },
      {
        id: 8,
        tool_name: "GitHub Copilot",
        tool_slug: "github-copilot",
        logo_url: "https://github.com/favicon.ico",
        best_for: "In-editor coding acceleration",
        website: "https://github.com/features/copilot",
        referral_url: null,
        category: "Coding",
        pricing: "Paid",
        pricing_tier: "paid_low",
        ease_of_use: 5,
        speed: 5,
        quality: 4,
        target_users: ["Developer"],
        tags: ["coding"],
        context_word: "autocomplete",
        record_status: "active"
      },
      {
        id: 9,
        tool_name: "Codeium",
        tool_slug: "codeium",
        logo_url: "https://codeium.com/favicon.ico",
        best_for: "Low-cost coding assistant",
        website: "https://codeium.com",
        referral_url: null,
        category: "Coding",
        pricing: "Free + paid",
        pricing_tier: "freemium",
        ease_of_use: 4,
        speed: 5,
        quality: 4,
        target_users: ["Developer", "Student"],
        tags: ["coding"],
        context_word: "free tier",
        record_status: "active"
      },
      {
        id: 10,
        tool_name: "Zapier",
        tool_slug: "zapier",
        logo_url: "https://zapier.com/favicon.ico",
        best_for: "No-code automation",
        website: "https://zapier.com",
        referral_url: null,
        category: "Automation",
        pricing: "Free + paid",
        pricing_tier: "freemium",
        ease_of_use: 5,
        speed: 5,
        quality: 4,
        target_users: ["Business", "Consultant", "Creator"],
        tags: ["automation"],
        context_word: "easy setup",
        record_status: "active"
      },
      {
        id: 11,
        tool_name: "Make",
        tool_slug: "make",
        logo_url: "https://www.make.com/favicon.ico",
        best_for: "Visual workflow automation",
        website: "https://www.make.com",
        referral_url: null,
        category: "Automation",
        pricing: "Free + paid",
        pricing_tier: "freemium",
        ease_of_use: 4,
        speed: 4,
        quality: 4,
        target_users: ["Business", "Consultant", "Developer"],
        tags: ["automation"],
        context_word: "visual builder",
        record_status: "active"
      },
      {
        id: 12,
        tool_name: "n8n",
        tool_slug: "n8n",
        logo_url: "https://n8n.io/favicon.ico",
        best_for: "Flexible open-source automation",
        website: "https://n8n.io",
        referral_url: null,
        category: "Automation",
        pricing: "Self-hosted + cloud",
        pricing_tier: "free",
        ease_of_use: 3,
        speed: 4,
        quality: 4,
        target_users: ["Developer", "Business"],
        tags: ["automation"],
        context_word: "open source",
        record_status: "active"
      }
    ],
    users: [],
    authSessions: [],
    authMagicLinks: [],
    recommendationSessions: [],
    recommendations: [],
    feedback: [],
    tryItClicks: []
  };
}

export function createInMemoryRepositories() {
  const data = baseData();
  const counters = {
    users: 1,
    authSessions: 1,
    authMagicLinks: 1,
    recommendationSessions: 1,
    recommendations: 1,
    feedback: 1,
    tryItClicks: 1
  };

  const catalogRepository = {
    async getProfiles() {
      return clone(data.profiles);
    },
    async getTasks() {
      return clone(data.tasks);
    },
    async getPriorities() {
      return clone(data.priorities);
    },
    async getTaskById(taskId) {
      return clone(data.tasks.find((row) => row.id === taskId) || null);
    },
    async getProfileById(profileId) {
      return clone(data.profiles.find((row) => row.id === profileId) || null);
    }
  };

  const sessionRepository = {
    async createSession({ profileId, taskId, selectedPriority, wizardDurationSeconds }) {
      const row = {
        id: counters.recommendationSessions++,
        user_id: null,
        profile_id: profileId,
        task_id: taskId,
        selected_priority: selectedPriority,
        wizard_duration_seconds: wizardDurationSeconds,
        created_at: now(),
        updated_at: now()
      };

      data.recommendationSessions.push(row);
      return clone(row);
    },
    async getSessionById(sessionId) {
      const row = data.recommendationSessions.find((candidate) => candidate.id === sessionId);
      if (!row) {
        return null;
      }

      const task = data.tasks.find((candidate) => candidate.id === row.task_id);
      const profile = data.profiles.find((candidate) => candidate.id === row.profile_id);

      return clone({
        ...row,
        task_name: task?.name,
        task_category: task?.category,
        profile_name: profile?.name
      });
    },
    async linkSessionToUser({ sessionId, userId }) {
      const row = data.recommendationSessions.find((candidate) => candidate.id === sessionId);
      if (!row) {
        return null;
      }
      row.user_id = row.user_id || userId;
      row.updated_at = now();
      return clone({ id: row.id, user_id: row.user_id });
    }
  };

  const toolRepository = {
    async getActiveToolsByCategories(categories) {
      return clone(
        data.tools.filter(
          (tool) => tool.record_status === "active" && categories.includes(tool.category)
        )
      );
    },
    async getAllActiveToolsExcludingCategories(categories) {
      return clone(
        data.tools.filter(
          (tool) => tool.record_status === "active" && !categories.includes(tool.category)
        )
      );
    },
    async getToolById(toolId) {
      return clone(data.tools.find((tool) => tool.id === toolId) || null);
    },
    async getToolsByIds(toolIds) {
      return clone(data.tools.filter((tool) => toolIds.includes(tool.id)));
    }
  };

  const recommendationRepository = {
    async findRecommendationBySessionId(sessionId) {
      return clone(data.recommendations.find((row) => row.session_id === sessionId) || null);
    },
    async findRecommendationById(recommendationId) {
      const recommendation = data.recommendations.find((row) => row.id === recommendationId);
      if (!recommendation) {
        return null;
      }

      const session = data.recommendationSessions.find((row) => row.id === recommendation.session_id);
      const task = data.tasks.find((row) => row.id === session?.task_id);

      return clone({
        ...recommendation,
        user_id: session?.user_id || null,
        selected_priority: session?.selected_priority,
        task_id: session?.task_id,
        task_name: task?.name || null
      });
    },
    async createRecommendation({ sessionId, primaryToolId, alternativeToolIds, primaryReason }) {
      const existing = data.recommendations.find((row) => row.session_id === sessionId);
      if (existing) {
        existing.primary_tool_id = primaryToolId;
        existing.alternative_tool_ids = [...alternativeToolIds];
        existing.primary_reason = primaryReason;
        existing.is_primary_locked = existing.unlocked_at ? false : true;
        return clone(existing);
      }

      const row = {
        id: counters.recommendations++,
        session_id: sessionId,
        primary_tool_id: primaryToolId,
        alternative_tool_ids: [...alternativeToolIds],
        primary_reason: primaryReason,
        is_primary_locked: true,
        unlocked_at: null,
        created_at: now()
      };

      data.recommendations.push(row);
      return clone(row);
    },
    async unlockRecommendation(recommendationId) {
      const row = data.recommendations.find((candidate) => candidate.id === recommendationId);
      if (!row) {
        return null;
      }

      row.is_primary_locked = false;
      row.unlocked_at = row.unlocked_at || now();
      return clone(row);
    },
    async createFeedback({ recommendationId, signal }) {
      const row = {
        id: counters.feedback++,
        recommendation_id: recommendationId,
        signal,
        created_at: now()
      };
      data.feedback.push(row);
      return clone(row);
    },
    async createTryItClick({ recommendationId, sessionId }) {
      const existing = data.tryItClicks.find(
        (row) => row.recommendation_id === recommendationId && row.session_id === sessionId
      );
      if (existing) {
        return clone(existing);
      }

      const row = {
        id: counters.tryItClicks++,
        recommendation_id: recommendationId,
        session_id: sessionId,
        created_at: now()
      };

      data.tryItClicks.push(row);
      return clone(row);
    }
  };

  const userRepository = {
    async upsertUser({ email, emailConsent, consentTimestamp, signupSource }) {
      const existing = data.users.find(
        (candidate) => candidate.email.toLowerCase() === email.toLowerCase()
      );

      if (existing) {
        existing.email_consent = emailConsent;
        existing.consent_timestamp = consentTimestamp;
        existing.signup_source = signupSource || existing.signup_source;
        existing.registered_at = existing.registered_at || null;
        existing.last_login_at = existing.last_login_at || null;
        existing.updated_at = now();
        return clone(existing);
      }

      const row = {
        id: counters.users++,
        email,
        email_consent: emailConsent,
        consent_timestamp: consentTimestamp,
        signup_source: signupSource,
        registered_at: null,
        last_login_at: null,
        plan: "free",
        subscription_status: "inactive",
        created_at: now(),
        updated_at: now()
      };

      data.users.push(row);
      return clone(row);
    }
  };

  const authRepository = {
    async findUserByEmail(email) {
      const user = data.users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase());
      return clone(user || null);
    },
    async findRegisteredUserByEmail(email) {
      const user = data.users.find(
        (candidate) =>
          candidate.email.toLowerCase() === email.toLowerCase() && candidate.registered_at
      );
      return clone(user || null);
    },
    async findUserById(userId) {
      const user = data.users.find((candidate) => candidate.id === userId);
      return clone(user || null);
    },
    async upsertUserForRegistration({
      email,
      emailConsent,
      consentTimestamp,
      signupSource,
      registeredAt
    }) {
      const existing = data.users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase());

      if (existing) {
        existing.email_consent = emailConsent;
        existing.consent_timestamp = consentTimestamp;
        existing.signup_source = signupSource || existing.signup_source;
        existing.registered_at = existing.registered_at || registeredAt;
        existing.updated_at = now();
        return clone(existing);
      }

      const row = {
        id: counters.users++,
        email,
        email_consent: emailConsent,
        consent_timestamp: consentTimestamp,
        signup_source: signupSource,
        registered_at: registeredAt,
        last_login_at: null,
        plan: "free",
        subscription_status: "inactive",
        created_at: now(),
        updated_at: now()
      };

      data.users.push(row);
      return clone(row);
    },
    async markUserLogin({ userId, loginAt }) {
      const user = data.users.find((candidate) => candidate.id === userId);
      if (!user) {
        return null;
      }

      user.last_login_at = loginAt;
      user.updated_at = now();
      return clone(user);
    },
    async createMagicLinkChallenge({ userId, tokenHash, expiresAt, userAgent, ipAddress, flow }) {
      const row = {
        id: counters.authMagicLinks++,
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        used_at: null,
        user_agent: userAgent,
        ip_address: ipAddress,
        flow,
        created_at: now()
      };

      data.authMagicLinks.push(row);
      return clone(row);
    },
    async consumeMagicLinkChallengeByTokenHash(tokenHash) {
      const row = data.authMagicLinks.find(
        (candidate) =>
          candidate.token_hash === tokenHash &&
          candidate.used_at == null &&
          candidate.expires_at > now()
      );

      if (!row) {
        return null;
      }

      row.used_at = now();
      return clone(row);
    },
    async createAuthSession({ userId, tokenHash, expiresAt, userAgent, ipAddress }) {
      const row = {
        id: counters.authSessions++,
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        user_agent: userAgent,
        ip_address: ipAddress,
        last_used_at: now(),
        created_at: now(),
        revoked_at: null
      };

      data.authSessions.push(row);
      return clone(row);
    },
    async findActiveSessionByTokenHash(tokenHash) {
      const session = data.authSessions.find(
        (candidate) =>
          candidate.token_hash === tokenHash &&
          candidate.revoked_at == null &&
          candidate.expires_at > now()
      );

      if (!session) {
        return null;
      }

      const user = data.users.find((candidate) => candidate.id === session.user_id);
      if (!user) {
        return null;
      }

      return clone({
        session_id: session.id,
        user_id: session.user_id,
        expires_at: session.expires_at,
        session_created_at: session.created_at,
        ...user
      });
    },
    async touchAuthSession(sessionId) {
      const session = data.authSessions.find((candidate) => candidate.id === sessionId);
      if (session) {
        session.last_used_at = now();
      }
    },
    async revokeAuthSessionById(sessionId) {
      const session = data.authSessions.find((candidate) => candidate.id === sessionId);
      if (session && !session.revoked_at) {
        session.revoked_at = now();
      }
    },
    async revokeAuthSessionByTokenHash(tokenHash) {
      const session = data.authSessions.find((candidate) => candidate.token_hash === tokenHash);
      if (session && !session.revoked_at) {
        session.revoked_at = now();
      }
    }
  };

  return {
    data,
    catalogRepository,
    sessionRepository,
    toolRepository,
    recommendationRepository,
    userRepository,
    authRepository
  };
}
