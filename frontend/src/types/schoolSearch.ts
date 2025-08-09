// utils/dataTypeMapping.ts

export const getDataTypeMapping = (dataType: string) => {
    switch (dataType) {
        case '국내대학':
            return {
                searchType: 'schools',
                apiDataType: '국내대학'
            };
        case '해외대학':
            return {
                searchType: 'schools',
                apiDataType: '해외대학'
            };
        case '국내대학전공':
            return {
                searchType: 'majors',
                apiDataType: '국내전공'
            };
        case '해외대학전공':
            return {
                searchType: 'majors',
                apiDataType: '해외전공'
            };
        default:
            return {
                searchType: 'autocomplete',
                apiDataType: dataType
            };
    }
};

export const getSchoolType = (lastSchool: string): string => {
    switch (lastSchool) {
        case 'high':
            return '';
        case 'univ2':
            return '전문대학';
        case 'univ4':
            return '대학';
        default:
            return '대학원';
    }
};