import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    Checkbox
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getDumsIntegratedList } from '../../../services/dums/dumsIntegratedService';

/**
 * DUMS 통합 데이터 목록을 표시하는 컴포넌트
 * @returns {JSX.Element} DUMS 통합 데이터 목록 컴포넌트
 */
const DumsIntegratedList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [selected, setSelected] = useState([]);

    const { data, isLoading, error } = useQuery({
        queryKey: ['dumsIntegrated', page, rowsPerPage, keyword],
        queryFn: () => getDumsIntegratedList({
            page: page + 1,
            size: rowsPerPage,
            keyword
        })
    });

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (event) => {
        setKeyword(event.target.value);
        setPage(0);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            setSelected(data?.content.map(row => row.id) || []);
        } else {
            setSelected([]);
        }
    };

    const handleClick = (id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    const getDataTypeLabel = (dataType) => {
        const labels = {
            DOMESTIC_UNIVERSITY: '국내 대학',
            INTERNATIONAL_UNIVERSITY: '해외 대학',
            MAJOR: '전공',
            CERTIFICATE: '자격증',
            UNIVERSITY_CLASSIFICATION: '대학 구분',
            GRADUATION_STATUS: '졸업 상태',
            REGION: '지역',
            COUNTRY: '국가'
        };
        return labels[dataType] || dataType;
    };

    if (isLoading) return <Typography>로딩 중...</Typography>;
    if (error) return <Typography color="error">데이터 로딩 중 오류가 발생했습니다.</Typography>;

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                DUMS 통합 데이터 관리
            </Typography>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="검색어를 입력하세요"
                value={keyword}
                onChange={handleSearch}
                sx={{ mb: 3 }}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selected.length > 0 && selected.length < (data?.content.length || 0)}
                                    checked={data?.content.length > 0 && selected.length === data.content.length}
                                    onChange={handleSelectAllClick}
                                />
                            </TableCell>
                            <TableCell>번호</TableCell>
                            <TableCell>데이터종류</TableCell>
                            <TableCell>코드번호</TableCell>
                            <TableCell>명칭</TableCell>
                            <TableCell>상태</TableCell>
                            <TableCell>관리자툴</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.content.map((row) => (
                            <TableRow 
                                key={`${row.dataType}-${row.id}`}
                                hover
                                selected={selected.indexOf(row.id) !== -1}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selected.indexOf(row.id) !== -1}
                                        onChange={() => handleClick(row.id)}
                                    />
                                </TableCell>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={getDataTypeLabel(row.dataType)}
                                        color="primary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{row.code || '-'}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.status || '-'}</TableCell>
                                <TableCell>
                                    <Tooltip title="수정">
                                        <IconButton size="small">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="삭제">
                                        <IconButton size="small" color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={data?.totalElements || 0}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="페이지당 행 수"
                labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} / 총 ${count}개`
                }
            />
        </Box>
    );
};

export default DumsIntegratedList; 