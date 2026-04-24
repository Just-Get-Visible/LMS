import DOMPurify from "isomorphic-dompurify";

import { cn } from "@/lib/utils";

interface Props {
  html: string | null | undefined;
  className?: string;
}

// Safe by default — DOMPurify strips <script>, event handlers, javascript:
// URLs, and other XSS vectors. We allow `target` so existing links still
// work, but force `rel="noopener noreferrer"` on any link with `target` set.
const ALLOWED_ATTR = [
  "href",
  "src",
  "alt",
  "title",
  "class",
  "id",
  "rel",
  "target",
  "name",
  "width",
  "height",
];

const HOOK_INSTALLED_KEY = "__lms_safehtml_hook";

function installHookOnce() {
  // Avoid attaching the hook on every render. DOMPurify is a singleton in
  // isomorphic-dompurify so this stays per-process.
  const dp = DOMPurify as unknown as Record<string, unknown>;
  if (dp[HOOK_INSTALLED_KEY]) return;
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (
      node instanceof Element &&
      node.tagName === "A" &&
      node.hasAttribute("target")
    ) {
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
  dp[HOOK_INSTALLED_KEY] = true;
}

export function SafeHtml({ html, className }: Props) {
  if (!html) return null;
  installHookOnce();

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_ATTR,
    USE_PROFILES: { html: true },
  });

  return (
    <div
      className={cn(className)}
      // Sanitized server-side via DOMPurify — safe to render.
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
