export type GradeRow = {
  id: number
  student: string
  course: string
  grade: number
  status: string
}

type GradesTableProps = {
  grades: GradeRow[]
  canManage?: boolean
  onEdit?: (grade: GradeRow) => void
  onDelete?: (id: number) => void
}

export function GradesTable({ grades, canManage = false, onEdit, onDelete }: GradesTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/70 bg-white/85 shadow-xl shadow-slate-200/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="bg-slate-100 text-sm text-gray-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">Course</th>
              <th className="px-4 py-3 font-semibold">Grade</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              {canManage ? <th className="px-4 py-3 font-semibold">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {grades.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-4 font-medium text-gray-950">{row.student}</td>
                <td className="px-4 py-4 text-gray-800">{row.course}</td>
                <td className="px-4 py-4 text-gray-800">{row.grade}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
                    {row.status}
                  </span>
                </td>
                {canManage ? (
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        type="button"
                        onClick={() => onEdit?.(row)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
                        type="button"
                        onClick={() => onDelete?.(row.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
