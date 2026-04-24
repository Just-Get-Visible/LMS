import { ResourceTypeIcon } from "@/components/resources/resource-type-icon";
import { Button } from "@/components/ui/button";
import { deleteResourceAction } from "@/lib/actions/resources";
import { formatFileSize } from "@/lib/format";
import type { Tables } from "@/types";

export function InstructorResourceList({
  resources,
}: {
  resources: Tables<"resources">[];
}) {
  if (resources.length === 0) {
    return (
      <p className="rounded-md bg-zinc-50 px-4 py-4 text-center text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        No resources yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-black/5 overflow-hidden rounded-xl border border-black/10 dark:divide-white/5 dark:border-white/10">
      {resources.map((resource) => (
        <ResourceRow key={resource.id} resource={resource} />
      ))}
    </ul>
  );
}

function ResourceRow({ resource }: { resource: Tables<"resources"> }) {
  const fileSize = formatFileSize(resource.file_size_bytes);
  return (
    <li className="flex items-center gap-4 bg-white px-4 py-3 dark:bg-zinc-950">
      <ResourceTypeIcon type={resource.resource_type} />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm font-medium">{resource.title}</p>
        {resource.description && (
          <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
            {resource.description}
          </p>
        )}
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-zinc-500 dark:text-zinc-400">
          {resource.external_url && <span>External link</span>}
          {resource.file_name && (
            <span className="truncate">{resource.file_name}</span>
          )}
          {fileSize && <span>{fileSize}</span>}
          {resource.is_public && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
              Public
            </span>
          )}
        </p>
      </div>
      <form action={deleteResourceAction.bind(null, resource.id)}>
        <Button type="submit" size="sm" variant="ghost">
          Delete
        </Button>
      </form>
    </li>
  );
}
