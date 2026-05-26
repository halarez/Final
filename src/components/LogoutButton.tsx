'use client'

export function LogoutButton() {
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <button
      className="w-fit rounded-md border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
      type="button"
      onClick={logout}
    >
      Logout
    </button>
  )
}
