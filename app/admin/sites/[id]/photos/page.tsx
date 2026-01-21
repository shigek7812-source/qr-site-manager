import PhotosClient from './PhotosClient';

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <PhotosClient siteId={params.id} />
    </div>
  );
}