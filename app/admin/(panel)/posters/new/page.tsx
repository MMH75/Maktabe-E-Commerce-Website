import AdminHeading from "@/components/admin/AdminHeading";
import PosterForm from "@/components/admin/PosterForm";
import { createPoster } from "../actions";

export default function NewPosterPage() {
  return (
    <>
      <AdminHeading title="Add a poster" subtitle="It will be added at the end of the carousel." />
      <PosterForm action={createPoster} />
    </>
  );
}
