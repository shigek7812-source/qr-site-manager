import PublicPhotosClient from "./photos/PublicPhotosClient";

export const revalidate = 0;

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <PublicPhotosClient code={code} />;
}