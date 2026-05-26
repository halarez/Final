import { cookies } from 'next/headers'
import { authCookieName, verifyAuthToken } from '@/src/lib/auth'
import { AdminGradesManager } from '@/src/components/AdminGradesManager'
import { LogoutButton } from '@/src/components/LogoutButton'

export default async function AdminGradesPage() {
  const token = (await cookies()).get(authCookieName)?.value
  const user = token ? verifyAuthToken(token) : null

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Admin dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-950">Grades management</h1>
            <p className="mt-2 text-gray-700">Signed in as {user?.email}</p>
          </div>
          <LogoutButton />
        </div>

        <AdminGradesManager />
      </section>
    </main>
  )
}
