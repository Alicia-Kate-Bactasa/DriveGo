/**
 * Security & URL Verification Utilities for DriveGo
 * - Malicious URL & Shortener Blocker
 * - Trusted Domain Whitelist & Verification Badges
 */

// Popular URL shorteners frequently used to conceal malicious destinations
const BLOCKED_SHORTENER_DOMAINS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "is.gd",
  "cli.gs",
  "pic.gd",
  "cutt.ly",
  "u.to",
  "j.mp",
  "buzurl.com",
  "cutt.us",
  "u.bb",
  "yourls.org",
  "x.co",
  "prettylinkpro.com",
  "scrnch.me",
  "filoops.info",
  "vzturl.com",
  "qr.net",
  "1url.com",
  "tweez.me",
  "v.gd",
  "tr.im",
  "linktr.ee",
  "shorturl.at",
  "rb.gy",
  "ow.ly",
  "buff.ly",
  "rebrand.ly",
  "adf.ly",
  "bl.ink",
  "shorte.st",
  "bc.vc",
]);

// Trusted platforms commonly used by genuine charity drives and humanitarian causes
const TRUSTED_DOMAINS = [
  // Social media verification sources
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "fb.me",
  "fb.watch",
  "instagram.com",
  "www.instagram.com",
  "twitter.com",
  "www.twitter.com",
  "x.com",
  "www.x.com",
  "tiktok.com",
  "www.tiktok.com",
  "youtube.com",
  "www.youtube.com",
  "youtu.be",

  // Crowdfunding & donation platforms
  "gofundme.com",
  "www.gofundme.com",
  "simplygiving.com",
  "www.simplygiving.com",
  "giving.sg",
  "www.giving.sg",
  "ketto.org",
  "www.ketto.org",
  "globalgiving.org",
  "www.globalgiving.org",
  "give.asia",
  "www.give.asia",

  // Major Philippine news & verified humanitarian NGOs
  "redcross.org.ph",
  "www.redcross.org.ph",
  "pna.gov.ph",
  "www.pna.gov.ph",
  "rappler.com",
  "www.rappler.com",
  "inquirer.net",
  "www.inquirer.net",
  "gmanetwork.com",
  "www.gmanetwork.com",
  "philstar.com",
  "www.philstar.com",
  "abs-cbn.com",
  "news.abs-cbn.com",
];

/**
 * Extracts and cleans the hostname from a given URL string.
 */
export function extractHostname(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Checks whether a given URL is a known URL shortener or obfuscation service.
 */
export function isUrlShortener(urlStr: string): boolean {
  const host = extractHostname(urlStr);
  if (!host) return false;
  return BLOCKED_SHORTENER_DOMAINS.has(host);
}

/**
 * Validates URL safety against disallowed protocols, IP addresses, and shorteners.
 */
export function validateSafeUrl(urlStr: string | null | undefined): {
  isValid: boolean;
  error?: string;
} {
  if (!urlStr || !urlStr.trim()) {
    return { isValid: true };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { isValid: false, error: "Please enter a valid, complete website URL." };
  }

  // Enforce HTTP / HTTPS only (strictly block javascript:, data:, file:, etc.)
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return {
      isValid: false,
      error: "Only secure web links (https://) are permitted.",
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Reject raw IP addresses (frequently used by malicious command-and-control servers)
  const isIpv4 = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
  const isIpv6 = hostname.startsWith("[") && hostname.endsWith("]");
  if (isIpv4 || isIpv6) {
    return {
      isValid: false,
      error: "Direct IP address links are prohibited for community security.",
    };
  }

  // Reject known URL shorteners
  if (isUrlShortener(urlStr)) {
    return {
      isValid: false,
      error:
        "URL shorteners (like bit.ly or tinyurl) are blocked to prevent deceptive links. Please paste the direct official post URL (e.g. from Facebook, Instagram, or official website).",
    };
  }

  return { isValid: true };
}

/**
 * Determines whether a URL originates from a trusted verified platform.
 */
export function getDomainTrust(urlStr: string | null | undefined): {
  isTrusted: boolean;
  domain: string;
  badgeLabel: string;
} {
  if (!urlStr) {
    return { isTrusted: false, domain: "", badgeLabel: "No link" };
  }

  const host = extractHostname(urlStr);
  if (!host) {
    return { isTrusted: false, domain: "", badgeLabel: "Invalid link" };
  }

  // Check against known whitelist or government / educational TLDs
  const matchesWhitelist = TRUSTED_DOMAINS.some(
    (domain) => host === domain || host.endsWith(`.${domain}`)
  );
  const isGovOrEdu =
    host.endsWith(".gov.ph") ||
    host.endsWith(".edu.ph") ||
    host.endsWith(".org.ph") ||
    host.endsWith(".gov") ||
    host.endsWith(".edu");

  if (matchesWhitelist || isGovOrEdu) {
    return {
      isTrusted: true,
      domain: host,
      badgeLabel: "Trusted Platform",
    };
  }

  return {
    isTrusted: false,
    domain: host,
    badgeLabel: "External Unverified Domain",
  };
}
