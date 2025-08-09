import { JobpostDataItem, OperationData } from "../api/jobpostData";
import getOperationData from "../api/operatuibData";
import { OperationDataResponse } from "../types/operationData";

export const mapCodesToLabels = (
  codes: string[],
  list: JobpostDataItem[],
): string[] =>
  codes.map((code) => {
    const found = list.find((item) => item.operationDataId === code);
    return found ? found.level2 || found.level1 || code : code;
  });
export const mapOperationCodesToLabels = (
  codes: string[],
  list: OperationData[],
): string[] =>
  codes.map((code) => {
    const found = list.find((item) => item.operationDataId === code);
    return found ? found.level2 || found.level1 || code : code;
  });

/**
 * 
 *      {mapCodesToLabels(
                                job.wrkcndtnLctRgnStr.split(","),
                                locationData,
                              ).join(", ")}
 * 
 */
// const [regionData, setRegionData] = useState<OperationDataResponse>();

export const fetchCodeData = async (
  code: string,
): Promise<OperationDataResponse> => {
  const response = await getOperationData(code);
  return response;
};
export const fetchOperationCodeData = async (
  code: string,
): Promise<OperationDataResponse> => {
  const response = await getOperationData(code);
  return response;
};
/**
 
mapOperationCodesToLabels(
                              [userProfile.nationality],
                              regions,
                            ).join(", ")


 */
