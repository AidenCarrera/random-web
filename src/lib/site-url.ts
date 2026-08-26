// Server-only: `SITE_URL` is not a `NEXT_PUBLIC_` variable, so it is undefined in
// the browser. Importing this module from a client component is a bug, and this
// guard surfaces it instead of silently falling back to the default origin.
if (typeof window !== "undefined") {
  throw new Error(
    "src/lib/site-url.ts is server-only and must not be imported from client components.",
  );
}

const DEFAULT_SITE_URL = "https://random.aidencarrera.com";

function getSiteUrl() {
  const configuredUrl = process.env.SITE_URL || DEFAULT_SITE_URL;
  let url: URL;

  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error(
      `SITE_URL must be a valid absolute URL. Received: '${configuredUrl}'.`,
    );
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "SITE_URL must contain only an HTTP(S) origin without credentials, a path, query parameters, or a hash.",
    );
  }

  return url.origin;
}

export const SITE_URL = getSiteUrl();
