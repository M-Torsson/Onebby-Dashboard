// MUI Imports
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'

const TablePaginationComponent = ({ table, totalCount }) => {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize

  // Use totalCount for manual pagination, or filtered rows for client-side pagination
  const total = totalCount !== undefined ? totalCount : table.getFilteredRowModel().rows.length
  const pageCount = Math.ceil(total / pageSize)

  return (
    <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
      <Typography color='text.disabled'>
        {`Showing ${total === 0 ? 0 : pageIndex * pageSize + 1}
        to ${Math.min((pageIndex + 1) * pageSize, total)} of ${total} entries`}
      </Typography>
      <Pagination
        shape='rounded'
        color='primary'
        variant='tonal'
        count={pageCount}
        page={pageIndex + 1}
        onChange={(_, page) => {
          table.setPageIndex(page - 1)
        }}
        showFirstButton
        showLastButton
      />
    </div>
  )
}

export default TablePaginationComponent
