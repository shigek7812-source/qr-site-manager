'use client';

import { useEffect, useState } from 'react';

export default function PhotosClient({ siteId }: { siteId: string }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ここで fetch('/api/...') する
    setLoading(false);
  }, [siteId]);

  return (
    <div>
      <h2>Photos for site {siteId}</h2>
      {loading ? 'Loading...' : 'Loaded'}
    </div>
  );
}