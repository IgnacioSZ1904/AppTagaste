import { membersLine, type Group } from '@/api/groups'

type Props = {
  groups: Group[]
  group: Group | null
  onChange: (id: number | null) => void
}

/** Selector de grupo con sus responsables debajo. */
export function GroupPicker({ groups, group, onChange }: Props) {
  if (groups.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <label className="flex items-center gap-2">
        <span className="text-sm font-medium">Grupo</span>
        <select
          className="field w-auto py-1"
          value={group?.id ?? ''}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">Todos los grupos</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>
      {group && (
        <p className="text-sm text-slate-600">
          {membersLine(group.members) || 'Sin responsables asignados'}
        </p>
      )}
    </div>
  )
}
