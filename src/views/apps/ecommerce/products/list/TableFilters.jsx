// React Imports
import { useMemo, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Vars
const productStockObj = {
  'In Stock': true,
  'Out of Stock': false
}

const TableFilters = ({
  dictionary = { common: {} },
  categories = [],
  categoryId = '',
  onCategoryChange,
  status = '',
  onStatusChange,
  stock = '',
  onStockChange
}) => {
  const [expanded, setExpanded] = useState({})

  const toggleExpanded = id => {
    setExpanded(prev => ({ ...prev, [id]: !prev?.[id] }))
  }

  const categoryOptions = useMemo(() => {
    const list = Array.isArray(categories) ? categories : []
    const byId = new Map(list.filter(Boolean).map(c => [String(c?.id ?? ''), c]))

    const childrenByParent = new Map()
    for (const c of list) {
      if (!c || c?.id == null) continue
      const pid = c?.parent_id == null ? null : String(c.parent_id)
      const arr = childrenByParent.get(pid) || []
      arr.push(c)
      childrenByParent.set(pid, arr)
    }

    const getName = c => String(c?.name ?? c?.label ?? '').trim()

    const sortByName = arr => {
      return [...arr].sort((a, b) => getName(a).localeCompare(getName(b)))
    }

    const roots = sortByName(childrenByParent.get(null) || [])

    const flatten = () => {
      const out = []
      const visited = new Set()

      const walk = (node, depth) => {
        const id = String(node?.id ?? '')
        if (!id) return
        if (visited.has(id)) return
        visited.add(id)

        const kids = sortByName(childrenByParent.get(id) || [])
        const hasChildren = kids.length > 0

        out.push({ id, label: getName(node), depth, hasChildren })

        if (hasChildren && expanded?.[id]) {
          for (const child of kids) {
            walk(child, depth + 1)
          }
        }
      }

      for (const root of roots) {
        walk(root, 0)
      }

      return out
    }

    // If the selected category is a child/grandchild, auto-expand its ancestors so user can see it.
    const selected = byId.get(String(categoryId || ''))
    if (selected) {
      const seen = new Set()
      let cur = selected
      while (cur && cur?.parent_id != null) {
        const pid = String(cur.parent_id)
        if (!pid || seen.has(pid)) break
        seen.add(pid)
        // Expand parent
        // NOTE: This does not mutate state; it just ensures options include the path.
        cur = byId.get(pid)
      }
    }

    return flatten()
  }, [categories, expanded, categoryId])

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id='select-status'
            value={status}
            onChange={e => onStatusChange?.(e.target.value)}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>{dictionary.common?.selectStatus || 'Select Status'}</MenuItem>
            <MenuItem value='Scheduled'>{dictionary.common?.scheduled || 'Scheduled'}</MenuItem>
            <MenuItem value='Published'>{dictionary.common?.publish || 'Publish'}</MenuItem>
            <MenuItem value='Inactive'>{dictionary.common?.inactive || 'Inactive'}</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id='select-category'
            value={String(categoryId ?? '')}
            onChange={e => onCategoryChange?.(e.target.value)}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>{dictionary.common?.selectCategory || 'Select Category'}</MenuItem>
            {categoryOptions.map(opt => (
              <MenuItem key={opt.id} value={opt.id} sx={{ pl: 2 + opt.depth * 3 }}>
                <div className='flex items-center justify-between w-full'>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {opt.label}
                  </span>
                  {opt.hasChildren ? (
                    <span
                      role='button'
                      tabIndex={-1}
                      onMouseDown={e => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleExpanded(opt.id)
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', paddingLeft: 10 }}
                      aria-label={expanded?.[opt.id] ? 'Collapse' : 'Expand'}
                      title={expanded?.[opt.id] ? 'Collapse' : 'Expand'}
                    >
                      <i className={expanded?.[opt.id] ? 'tabler-chevron-down' : 'tabler-chevron-right'} />
                    </span>
                  ) : null}
                </div>
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id='select-stock'
            value={stock}
            onChange={e => onStockChange?.(e.target.value)}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>{dictionary.common?.selectStock || 'Select Stock'}</MenuItem>
            <MenuItem value='In Stock'>{dictionary.common?.inStock || 'In Stock'}</MenuItem>
            <MenuItem value='Out of Stock'>{dictionary.common?.outOfStock || 'Out of Stock'}</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
