import { OperationData } from '../types/operationData';

export const getLabel = (option: OperationData): string => {
  return option.level3 || option.level2 || option.level1 || '';
};

export const isOptionSelected = (selectedOptions: OperationData[], option: OperationData): boolean => {
  return selectedOptions.some(opt => opt.operationDataId === option.operationDataId);
};

export const addOption = (selectedOptions: OperationData[], option: OperationData): OperationData[] => {
  if (isOptionSelected(selectedOptions, option)) {
    return selectedOptions;
  }
  return [...selectedOptions, option];
};

export const removeOption = (selectedOptions: OperationData[], option: OperationData): OperationData[] => {
  return selectedOptions.filter(opt => opt.operationDataId !== option.operationDataId);
};

export const toggleOption = (selectedOptions: OperationData[], option: OperationData): OperationData[] => {
  if (isOptionSelected(selectedOptions, option)) {
    return removeOption(selectedOptions, option);
  }
  return addOption(selectedOptions, option);
}; 