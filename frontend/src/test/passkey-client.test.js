import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPasskeyCredential,
  getPasskeyCredential
} from "../features/auth/passkeyClient";

function toBuffer(...values) {
  return new Uint8Array(values).buffer;
}

function setNavigatorProp(name, value) {
  Object.defineProperty(window.navigator, name, {
    value,
    configurable: true
  });
}

function setIosSafariUserAgent() {
  setNavigatorProp(
    "userAgent",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1"
  );
  setNavigatorProp("platform", "iPhone");
  setNavigatorProp("maxTouchPoints", 5);
}

function setDesktopChromeUserAgent() {
  setNavigatorProp(
    "userAgent",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  );
  setNavigatorProp("platform", "MacIntel");
  setNavigatorProp("maxTouchPoints", 0);
}

function stubPasskeyApis({ createCredential, getCredential }) {
  Object.defineProperty(window, "PublicKeyCredential", {
    value: class PublicKeyCredentialMock {},
    configurable: true
  });

  const createMock = vi.fn(async () => createCredential);
  const getMock = vi.fn(async () => getCredential);

  Object.defineProperty(window.navigator, "credentials", {
    value: {
      create: createMock,
      get: getMock
    },
    configurable: true
  });

  return {
    createMock,
    getMock
  };
}

describe("passkey client viewport behavior", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("normalizes viewport around iOS Safari passkey sign-in", async () => {
    setIosSafariUserAgent();
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    const blurSpy = vi.spyOn(input, "blur");

    const { getMock } = stubPasskeyApis({
      createCredential: null,
      getCredential: {
        id: "authentication-credential-id",
        type: "public-key",
        rawId: toBuffer(11, 12, 13),
        response: {
          clientDataJSON: toBuffer(15, 16, 17),
          authenticatorData: toBuffer(18, 19, 20),
          signature: toBuffer(21, 22, 23),
          userHandle: null
        }
      }
    });

    await getPasskeyCredential({
      challenge: "BAUGBw",
      timeout: 60000,
      rpId: "localhost",
      userVerification: "preferred",
      allowCredentials: [{ id: "AQID", type: "public-key" }]
    });

    expect(getMock).toHaveBeenCalledTimes(1);
    expect(blurSpy).toHaveBeenCalled();
    expect(scrollSpy).toHaveBeenCalled();
  });

  it("normalizes viewport around iOS Safari passkey registration", async () => {
    setIosSafariUserAgent();
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    const blurSpy = vi.spyOn(input, "blur");

    const { createMock } = stubPasskeyApis({
      createCredential: {
        id: "registration-credential-id",
        type: "public-key",
        rawId: toBuffer(1, 2, 3),
        response: {
          clientDataJSON: toBuffer(5, 6, 7),
          attestationObject: toBuffer(8, 9, 10),
          getTransports: () => ["internal"]
        }
      },
      getCredential: null
    });

    await createPasskeyCredential({
      challenge: "AAECAw",
      rp: { name: "TrustMeBroAI", id: "localhost" },
      user: {
        id: "dXNlci0x",
        name: "person@example.com",
        displayName: "person@example.com"
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      timeout: 60000,
      attestation: "none"
    });

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(blurSpy).toHaveBeenCalled();
    expect(scrollSpy).toHaveBeenCalled();
  });

  it("does not run viewport normalization on non-iOS browsers", async () => {
    setDesktopChromeUserAgent();
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    const blurSpy = vi.spyOn(input, "blur");

    const { getMock } = stubPasskeyApis({
      createCredential: null,
      getCredential: {
        id: "authentication-credential-id",
        type: "public-key",
        rawId: toBuffer(11, 12, 13),
        response: {
          clientDataJSON: toBuffer(15, 16, 17),
          authenticatorData: toBuffer(18, 19, 20),
          signature: toBuffer(21, 22, 23),
          userHandle: null
        }
      }
    });

    await getPasskeyCredential({
      challenge: "BAUGBw",
      timeout: 60000,
      rpId: "localhost",
      userVerification: "preferred",
      allowCredentials: [{ id: "AQID", type: "public-key" }]
    });

    expect(getMock).toHaveBeenCalledTimes(1);
    expect(blurSpy).not.toHaveBeenCalled();
    expect(scrollSpy).not.toHaveBeenCalled();
  });
});
