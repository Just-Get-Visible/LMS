import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

const proseClasses = cn(
  "leading-relaxed text-zinc-800 dark:text-zinc-200",
  "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
  "[&_p]:my-3",
  "[&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold",
  "[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold",
  "[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold",
  "[&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:text-base [&_h4]:font-semibold",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5",
  "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_li]:my-1",
  "[&_a]:text-blue-600 [&_a]:underline-offset-2 hover:[&_a]:underline dark:[&_a]:text-blue-400",
  "[&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] dark:[&_code]:bg-zinc-800",
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-zinc-900 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-zinc-100 dark:[&_pre]:bg-zinc-950",
  "[&_pre_code]:bg-transparent [&_pre_code]:px-0 [&_pre_code]:py-0",
  "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-700 dark:[&_blockquote]:border-zinc-700 dark:[&_blockquote]:text-zinc-300",
  "[&_strong]:font-semibold",
  "[&_hr]:my-6 [&_hr]:border-zinc-200 dark:[&_hr]:border-zinc-800",
  "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
  "[&_th]:border [&_th]:border-zinc-200 [&_th]:bg-zinc-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium dark:[&_th]:border-zinc-800 dark:[&_th]:bg-zinc-900",
  "[&_td]:border [&_td]:border-zinc-200 [&_td]:px-3 [&_td]:py-2 dark:[&_td]:border-zinc-800",
);

export function Markdown({
  children,
  className,
}: {
  children: string | null | undefined;
  className?: string;
}) {
  if (!children) return null;
  return (
    <div className={cn(proseClasses, className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
