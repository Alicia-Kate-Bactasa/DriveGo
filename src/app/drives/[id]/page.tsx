import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DrivePage({ params }: Props) {
  const { id } = await params;
  redirect(`/?driveId=${id}`);
}