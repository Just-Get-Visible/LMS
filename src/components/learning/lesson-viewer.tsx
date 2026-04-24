import { SafeHtml } from "@/components/safe-html";
import type { Tables } from "@/types";

export function LessonViewer({ lesson }: { lesson: Tables<"lessons"> }) {
  return (
    <article className="space-y-6">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {lesson.title}
        </h1>
        {lesson.summary && (
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            {lesson.summary}
          </p>
        )}
      </header>
      <LessonBody lesson={lesson} />
    </article>
  );
}

function LessonBody({ lesson }: { lesson: Tables<"lessons"> }) {
  switch (lesson.lesson_type) {
    case "video":
      return <VideoBody lesson={lesson} />;
    case "text":
      return <TextBody lesson={lesson} />;
    case "document":
      return (
        <Stub message="This lesson's documents are listed below." />
      );
    case "live_session":
      return <Stub message="Live session viewer coming soon." />;
    case "quiz":
      return <Stub message="Quiz player coming soon." />;
    case "assignment":
      return <Stub message="Assignment viewer coming soon." />;
  }
}

function VideoBody({ lesson }: { lesson: Tables<"lessons"> }) {
  if (!lesson.video_url) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No video uploaded yet.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      <div className="aspect-video overflow-hidden rounded-xl bg-black">
        <video
          controls
          className="h-full w-full"
          src={lesson.video_url}
          preload="metadata"
        />
      </div>
      {lesson.transcript && (
        <details className="rounded-md border border-black/10 p-4 dark:border-white/10">
          <summary className="cursor-pointer text-sm font-medium">
            Transcript
          </summary>
          <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {lesson.transcript}
          </p>
        </details>
      )}
    </div>
  );
}

function TextBody({ lesson }: { lesson: Tables<"lessons"> }) {
  if (lesson.content_html) {
    return (
      <SafeHtml
        html={lesson.content_html}
        className="space-y-4 leading-relaxed text-zinc-800 dark:text-zinc-200 [&_a]:text-zinc-900 [&_a]:underline dark:[&_a]:text-zinc-100 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-zinc-900 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-zinc-100"
      />
    );
  }
  if (lesson.summary) {
    return (
      <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
        {lesson.summary}
      </p>
    );
  }
  return <Stub message="No content yet." />;
}

function Stub({ message }: { message: string }) {
  return (
    <div className="rounded-md bg-zinc-100 px-4 py-6 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
      {message}
    </div>
  );
}
