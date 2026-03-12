import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

function normalizeOriginList(origins) {
  return String(origins || "http://localhost:5174")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function normalizeTransports(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((transport) => typeof transport === "string" && transport.trim())
    .map((transport) => transport.trim());
}

export function createPasskeyAdapter({ rpId, rpName, origins } = {}) {
  const expectedRpId = String(rpId || "localhost").trim();
  const expectedOrigins = normalizeOriginList(origins);
  const relyingPartyName = String(rpName || "TrustMeBroAI").trim() || "TrustMeBroAI";

  return {
    rpId: expectedRpId,
    expectedOrigins,

    async generateRegistrationOptions({ challenge, user, excludeCredentialIds }) {
      const normalizedChallenge =
        typeof challenge === "string" ? isoBase64URL.toBuffer(challenge) : challenge;

      const options = await generateRegistrationOptions({
        rpName: relyingPartyName,
        rpID: expectedRpId,
        userName: user.email,
        userID: isoBase64URL.toBuffer(user.id),
        userDisplayName: user.email,
        challenge: normalizedChallenge,
        timeout: 60_000,
        attestationType: "none",
        excludeCredentials: (excludeCredentialIds || []).map((credentialId) => ({
          id: credentialId,
          transports: ["internal", "usb", "ble", "nfc"]
        })),
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "preferred"
        },
        preferredAuthenticatorType: "localDevice"
      });

      return options;
    },

    async verifyRegistrationCredential({
      credential,
      expectedChallenge,
      requireUserVerification = true
    }) {
      let verification;
      try {
        verification = await verifyRegistrationResponse({
          response: credential,
          expectedChallenge,
          expectedOrigin: expectedOrigins,
          expectedRPID: expectedRpId,
          requireUserVerification
        });
      } catch {
        return {
          verified: false
        };
      }

      if (!verification.verified || !verification.registrationInfo?.credential) {
        return {
          verified: false
        };
      }

      return {
        verified: true,
        registration: {
          credentialId: verification.registrationInfo.credential.id,
          publicKey: isoBase64URL.fromBuffer(verification.registrationInfo.credential.publicKey),
          counter: verification.registrationInfo.credential.counter,
          transports: normalizeTransports(credential?.response?.transports),
          aaguid: verification.registrationInfo.aaguid || null
        }
      };
    },

    async generateAuthenticationOptions({ challenge, allowCredentialIds }) {
      const normalizedChallenge =
        typeof challenge === "string" ? isoBase64URL.toBuffer(challenge) : challenge;

      const options = await generateAuthenticationOptions({
        rpID: expectedRpId,
        challenge: normalizedChallenge,
        timeout: 60_000,
        userVerification: "preferred",
        allowCredentials: (allowCredentialIds || []).map((credentialId) => ({
          id: credentialId,
          transports: ["internal", "usb", "ble", "nfc"]
        }))
      });

      return options;
    },

    async verifyAuthenticationCredential({
      credential,
      expectedChallenge,
      passkey,
      requireUserVerification = true
    }) {
      let verification;
      try {
        verification = await verifyAuthenticationResponse({
          response: credential,
          expectedChallenge,
          expectedOrigin: expectedOrigins,
          expectedRPID: expectedRpId,
          credential: {
            id: passkey.credential_id,
            publicKey: isoBase64URL.toBuffer(passkey.public_key),
            counter: Number(passkey.counter || 0),
            transports: normalizeTransports(passkey.transports)
          },
          requireUserVerification
        });
      } catch {
        return {
          verified: false
        };
      }

      if (!verification.verified || !verification.authenticationInfo) {
        return {
          verified: false
        };
      }

      return {
        verified: true,
        authentication: {
          credentialId: verification.authenticationInfo.credentialID,
          newCounter: verification.authenticationInfo.newCounter
        }
      };
    }
  };
}
