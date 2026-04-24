import { PostComposer } from "@/components/discussions/post-composer";
import { Markdown } from "@/components/markdown";
import type { PostWithAuthor } from "@/lib/data/discussions";
import { formatDateTime } from "@/lib/format";

type PostNode = PostWithAuthor & { children: PostNode[] };

function buildTree(posts: PostWithAuthor[]): PostNode[] {
  const byId = new Map<string, PostNode>();
  const roots: PostNode[] = [];

  for (const item of posts) {
    byId.set(item.post.id, { ...item, children: [] });
  }

  for (const item of posts) {
    const node = byId.get(item.post.id)!;
    const parentId = item.post.parent_post_id;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

interface Props {
  threadId: string;
  posts: PostWithAuthor[];
  isLocked: boolean;
}

export function PostList({ threadId, posts, isLocked }: Props) {
  const tree = buildTree(posts);

  if (tree.length === 0) {
    return (
      <p className="rounded-md bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        No replies yet. Be the first to post.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {tree.map((node) => (
        <PostNodeItem
          key={node.post.id}
          node={node}
          threadId={threadId}
          depth={0}
          isLocked={isLocked}
        />
      ))}
    </ul>
  );
}

const INDENT = ["pl-0", "pl-6", "pl-12", "pl-16"];

function PostNodeItem({
  node,
  threadId,
  depth,
  isLocked,
}: {
  node: PostNode;
  threadId: string;
  depth: number;
  isLocked: boolean;
}) {
  const indentClass = INDENT[Math.min(depth, INDENT.length - 1)];
  const authorName =
    node.author?.full_name?.trim() ||
    `${node.author?.first_name ?? ""} ${node.author?.last_name ?? ""}`.trim() ||
    "User";

  return (
    <li className={indentClass}>
      <article className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
        <header className="mb-2 flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {authorName}
          </span>
          <span>{formatDateTime(node.post.created_at)}</span>
        </header>
        <Markdown className="text-sm">{node.post.body}</Markdown>
        {!isLocked && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              Reply
            </summary>
            <div className="mt-3">
              <PostComposer
                threadId={threadId}
                parentPostId={node.post.id}
              />
            </div>
          </details>
        )}
      </article>

      {node.children.length > 0 && (
        <ul className="mt-3 space-y-3">
          {node.children.map((child) => (
            <PostNodeItem
              key={child.post.id}
              node={child}
              threadId={threadId}
              depth={depth + 1}
              isLocked={isLocked}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
