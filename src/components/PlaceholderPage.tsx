export default function PlaceholderPage({
  title,
  titleUr,
}: {
  title: string;
  titleUr?: string;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:py-32">
      {titleUr && (
        <p dir="rtl" lang="ur" className="font-urdu text-2xl leading-[3.5rem] text-forest">
          {titleUr}
        </p>
      )}
      <h1 className="font-heading text-4xl font-bold text-emerald-deep">
        {title}
      </h1>
      <div className="my-6 flex items-center gap-3">
        <span className="h-px w-12 bg-gold" />
        <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
        <span className="h-px w-12 bg-gold" />
      </div>
      <p className="text-sm text-softgray">
        This page is coming soon, insha&apos;Allah. We are preparing something
        beautiful for you.
      </p>
    </div>
  );
}
