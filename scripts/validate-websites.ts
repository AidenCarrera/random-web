import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createWebsiteMetadata } from "../src/lib/websiteMetadata.ts";
import { WEBSITES } from "../src/lib/websites.ts";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const appDirectory = path.join(repositoryRoot, "src", "app");
const reservedPageRoutes = new Set(["dev", "privacy"]);
const routePattern = /^\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function main() {
  const errors: string[] = [];
  const registeredPaths = new Set<string>();

  for (const website of WEBSITES) {
    if (!routePattern.test(website.path)) {
      errors.push(`Invalid website path: '${website.path}'.`);
    }

    if (registeredPaths.has(website.path)) {
      errors.push(`Duplicate website path: '${website.path}'.`);
    }

    registeredPaths.add(website.path);

    if (!isoDatePattern.test(website.lastModified)) {
      errors.push(
        `Invalid lastModified date for '${website.path}': '${website.lastModified}'.`,
      );
    }

    if (!website.title.trim() || !website.blurb.trim()) {
      errors.push(`Website display copy is incomplete for '${website.path}'.`);
    }

    if (
      !website.metadata.title.trim() ||
      !website.metadata.description.trim()
    ) {
      errors.push(`Website metadata is incomplete for '${website.path}'.`);
    }

    const routeDirectory = path.join(
      appDirectory,
      website.path.replace(/^\//, ""),
    );
    const pagePath = path.join(routeDirectory, "page.tsx");
    const layoutPath = path.join(routeDirectory, "layout.tsx");

    if (!fs.existsSync(pagePath)) {
      errors.push(`Registered website page is missing: ${pagePath}`);
    }

    if (!fs.existsSync(layoutPath)) {
      errors.push(`Registered website layout is missing: ${layoutPath}`);
    } else {
      const layoutSource = fs.readFileSync(layoutPath, "utf8");
      const expectedCall = `createWebsiteMetadata("${website.path}")`;

      if (!layoutSource.includes(expectedCall)) {
        errors.push(
          `Website layout does not use its registered metadata: ${layoutPath}`,
        );
      }
    }

    createWebsiteMetadata(website.path);
  }

  for (const entry of fs.readdirSync(appDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory() || reservedPageRoutes.has(entry.name)) {
      continue;
    }

    const pagePath = path.join(appDirectory, entry.name, "page.tsx");
    const routePath = `/${entry.name}`;

    if (fs.existsSync(pagePath) && !registeredPaths.has(routePath)) {
      errors.push(`Page route is not registered in WEBSITES: '${routePath}'.`);
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`- ${error}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log(`Validated ${WEBSITES.length} registered websites.`);
}

main();
