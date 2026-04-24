import { ResourceDownloadButton } from "@/components/resources/resource-download-button";
import { ResourceTypeIcon } from "@/components/resources/resource-type-icon";
import { formatFileSize } from "@/lib/format";
import type { Tables } from "@/types";

interface Props {
  resources: Tables<"resources">[];
  title?: string;
}

export function ResourceList({ resources, title = "Resources" }: Props) {
  if (resources.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <ul className="divide-y divide-black/5 overflow-hidden rounded-xl border border-black/10 dark:divide-white/5 dark:border-white/10">
        {resources.map((resource) => (
          <ResourceRow key={resource.id} resource={resource} />
        ))}
      </ul>
    </section>
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
        {(resource.file_name || fileSize) && (
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-zinc-500 dark:text-zinc-400">
            {resource.file_name && (
              <span className="truncate">{resource.file_name}</span>
            )}
            {fileSize && <span>{fileSize}</span>}
          </p>
        )}
      </div>
      <ResourceDownloadButton
        resourceId={resource.id}
        isDownloadable={resource.is_downloadable}
      />
    </li>
  );
}
