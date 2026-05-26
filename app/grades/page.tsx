import { cookies } from 'next/headers'
import { authCookieName, verifyAuthToken } from '@/src/lib/auth'
import { GradesTable } from '@/src/components/GradesTable'
import { LogoutButton } from '@/src/components/LogoutButton'

const grades = [
  { id: 1, student: 'Hala Rez', course: 'Mathematics', grade: 89, status: 'Published' },
  { id: 2, student: 'Hala Rez', course: 'Science', grade: 92, status: 'Published' },
  { id: 3, student: 'Hala Rez', course: 'English', grade: 87, status: 'Published' },
  { id: 4, student: 'Hala Rez', course: 'Computer Science', grade: 95, status: 'Published' },
]

export default async function UserGradesPage() {
  const token = (await cookies()).get(authCookieName)?.value
  const user = token ? verifyAuthToken(token) : null

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Student portal</p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-950">My grades</h1>
            <p className="mt-2 text-gray-700">Signed in as {user?.email}</p>
          </div>
          <LogoutButton />
        </div>

        <GradesTable grades={grades} />
      </section>
    </main>
  )
}
