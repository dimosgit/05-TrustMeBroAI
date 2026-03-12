import en from "./locales/en";

const DEFAULT_LOCALE = "en";
const dictionaries = {
  en
};

function readMessage(dictionary, key) {
  return key.split(".").reduce((current, segment) => {
    if (!current || typeof current !== "object") {
      return null;
    }

    return current[segment] ?? null;
  }, dictionary);
}

function interpolate(message, params) {
  return message.replace(/\{(\w+)\}/g, (_, token) => {
    const value = params[token];
    return value == null ? "" : String(value);
  });
}

export function t(key, params = {}, fallback = key) {
  const dictionary = dictionaries[DEFAULT_LOCALE] || {};
  const template = readMessage(dictionary, key);

  if (typeof template !== "string") {
    return fallback;
  }

  return interpolate(template, params);
}
