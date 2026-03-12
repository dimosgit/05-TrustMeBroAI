function toBase64Url(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value) {
  return Buffer.from(String(value || ""), "base64url").toString("utf8");
}

function readClientChallenge(credential) {
  const encodedClientData = credential?.response?.clientDataJSON;
  if (typeof encodedClientData !== "string" || !encodedClientData) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encodedClientData));
    return typeof parsed?.challenge === "string" ? parsed.challenge : null;
  } catch {
    return null;
  }
}

async function evaluateExpectedChallenge(expectedChallenge, challenge) {
  if (typeof expectedChallenge === "function") {
    return Boolean(await expectedChallenge(challenge));
  }

  return expectedChallenge === challenge;
}

export function createFakePasskeyAdapter() {
  return {
    rpId: "localhost",
    expectedOrigins: ["http://localhost:5174", "http://127.0.0.1:5174"],

    async generateRegistrationOptions({ challenge, user, excludeCredentialIds }) {
      return {
        challenge,
        rp: {
          id: "localhost",
          name: "TrustMeBroAI Test"
        },
        user: {
          id: toBase64Url(String(user.id)),
          name: user.email,
          displayName: user.email
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        timeout: 60_000,
        attestation: "none",
        excludeCredentials: (excludeCredentialIds || []).map((id) => ({
          id,
          type: "public-key",
          transports: ["internal"]
        }))
      };
    },

    async verifyRegistrationCredential({ credential, expectedChallenge }) {
      if (!credential || typeof credential.id !== "string" || !credential.id) {
        return { verified: false };
      }

      const challenge = readClientChallenge(credential);
      if (!challenge) {
        return { verified: false };
      }

      const isChallengeValid = await evaluateExpectedChallenge(expectedChallenge, challenge);
      if (!isChallengeValid) {
        return { verified: false };
      }

      return {
        verified: true,
        registration: {
          credentialId: credential.id,
          publicKey: toBase64Url(`public-key:${credential.id}`),
          counter: 0,
          transports: Array.isArray(credential?.response?.transports)
            ? credential.response.transports
            : ["internal"],
          aaguid: "00000000-0000-0000-0000-000000000000"
        }
      };
    },

    async generateAuthenticationOptions({ challenge, allowCredentialIds }) {
      return {
        challenge,
        rpId: "localhost",
        timeout: 60_000,
        userVerification: "preferred",
        allowCredentials: (allowCredentialIds || []).map((id) => ({
          id,
          type: "public-key",
          transports: ["internal"]
        }))
      };
    },

    async verifyAuthenticationCredential({ credential, expectedChallenge, passkey }) {
      if (!credential || typeof credential.id !== "string" || credential.id !== passkey.credential_id) {
        return { verified: false };
      }

      const challenge = readClientChallenge(credential);
      if (!challenge) {
        return { verified: false };
      }

      const isChallengeValid = await evaluateExpectedChallenge(expectedChallenge, challenge);
      if (!isChallengeValid) {
        return { verified: false };
      }

      return {
        verified: true,
        authentication: {
          credentialId: passkey.credential_id,
          newCounter: Number(passkey.counter || 0) + 1
        }
      };
    }
  };
}
