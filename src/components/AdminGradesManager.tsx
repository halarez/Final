'use client'

import { useMemo, useState } from 'react'
import { GradesTable, type GradeRow } from './GradesTable'

const initialGrades: GradeRow[] = [
  { id: 1, student: 'Hala Rez', course: 'Mathematics', grade: 96, status: 'Published' },
  { id: 2, student: 'Hala Rez', course: 'Science', grade: 93, status: 'Published' },
  { id: 3, student: 'Student User', course: 'English', grade: 91, status: 'Review' },
  { id: 4, student: 'Student User', course: 'Computer Science', grade: 98, status: 'Published' },
]

const emptyForm = {
  student: '',
  course: '',
  grade: 0,
  status: 'Published',
}

export function AdminGradesManager() {
  const [grades, setGrades] = useState<GradeRow[]>(initialGrades)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

  const stats = useMemo(() => {
    return {
      students: new Set(grades.map((grade) => grade.student)).size,
      published: grades.filter((grade) => grade.status === 'Published').length,
      review: grades.filter((grade) => grade.status !== 'Published').length,
    }
  }, [grades])

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
  }

  function saveGrade(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (editingId) {
      setGrades((current) =>
        current.map((grade) => (grade.id === editingId ? { ...grade, ...form, grade: Number(form.grade) } : grade)),
      )
      resetForm()
      return
    }

    setGrades((current) => [
      ...current,
      {
        id: Date.now(),
        ...form,
        grade: Number(form.grade),
      },
    ])
    resetForm()
  }

  function editGrade(grade: GradeRow) {
    setEditingId(grade.id)
    setForm({
      student: grade.student,
      course: grade.course,
      grade: grade.grade,
      status: grade.status,
    })
  }

  function deleteGrade(id: number) {
    setGrades((current) => current.filter((grade) => grade.id !== id))
  }

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-white/70 bg-white/85 p-4 shadow-sm">
          <p className="text-sm text-gray-600">Students</p>
          <p className="mt-1 text-2xl font-semibold text-gray-950">{stats.students}</p>
        </div>
        <div className="rounded-lg border border-white/70 bg-white/85 p-4 shadow-sm">
          <p className="text-sm text-gray-600">Published grades</p>
          <p className="mt-1 text-2xl font-semibold text-gray-950">{stats.published}</p>
        </div>
        <div className="rounded-lg border border-white/70 bg-white/85 p-4 shadow-sm">
          <p className="text-sm text-gray-600">Pending reviews</p>
          <p className="mt-1 text-2xl font-semibold text-gray-950">{stats.review}</p>
        </div>
      </div>

      <form className="mb-6 grid gap-3 rounded-lg border border-white/70 bg-white/85 p-4 shadow-sm md:grid-cols-5" onSubmit={saveGrade}>
        <input
          className="rounded-md border border-gray-300 px-3 py-2"
          placeholder="Student"
          value={form.student}
          onChange={(event) => setForm({ ...form, student: event.target.value })}
          required
        />
        <input
          className="rounded-md border border-gray-300 px-3 py-2"
          placeholder="Course"
          value={form.course}
          onChange={(event) => setForm({ ...form, course: event.target.value })}
          required
        />
        <input
          className="rounded-md border border-gray-300 px-3 py-2"
          min={0}
          max={100}
          placeholder="Grade"
          type="number"
          value={form.grade || ''}
          onChange={(event) => setForm({ ...form, grade: Number(event.target.value) })}
          required
        />
        <select
          className="rounded-md border border-gray-300 px-3 py-2"
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value })}
        >
          <option>Published</option>
          <option>Review</option>
          <option>Draft</option>
        </select>
        <div className="flex gap-2">
          <button className="flex-1 rounded-md bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800" type="submit">
            {editingId ? 'Save' : 'Add'}
          </button>
          {editingId ? (
            <button className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50" type="button" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <GradesTable grades={grades} canManage onEdit={editGrade} onDelete={deleteGrade} />
    </>
  )
}
