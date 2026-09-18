export function NotesSection({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null;

  return (
    <div className="rounded-lg border border-notes-border bg-notes-bg p-6">
      <h3 className="mb-4 font-display text-xl text-notes-heading">
        Chef&apos;s notes
      </h3>
      <div className="space-y-2.5">
        {notes.map((note, index) => (
          <div key={index} className="flex gap-3">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-notes-bullet" />
            <p className="text-base leading-relaxed text-notes-heading">
              {note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
