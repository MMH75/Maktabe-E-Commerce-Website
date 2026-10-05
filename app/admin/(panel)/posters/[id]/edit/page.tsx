import { notFound } from "next/navigation";
import AdminHeading from "@/components/admin/AdminHeading";
import PosterForm from "@/components/admin/PosterForm";
import { getPoster } from "@/lib/posters";
import { updatePoster } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const poster = await getPoster(numericId);
  if (!poster) notFound();

  return (
    <>
      <AdminHeading title="Edit poster" subtitle={poster.altText} />
      <PosterForm action={updatePoster.bind(null, poster.id)} poster={poster} />
    </>
  );
}
