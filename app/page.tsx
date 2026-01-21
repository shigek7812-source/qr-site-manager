import { supabase } from '@/lib/supabase'

export default async function Page() {
  const { data, error } = await supabase.from('sites').select('*')
  return (
    <main style={{ padding: 20 }}>
      <h1>Supabase 接続テスト</h1>
      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </main>
  )
}