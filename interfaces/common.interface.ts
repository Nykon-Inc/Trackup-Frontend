export interface ITablePagination {
    page: number;
    rowsPerPage: number;
    onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    totalResults: number;
}

export type PaginatedResult<T> = {
    results: T[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
};