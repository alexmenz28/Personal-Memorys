import { redirect } from "next/navigation";

type PersonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params;
  redirect(`/people?person=${id}`);
}
