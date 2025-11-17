import { useState } from "react";

import { getDepartment, getProfitAndLossData } from "../services/queries";

import { parse } from "./../utils/parse";
import { getSession } from "../utils/clientSession";

const mapDepartmentToProfitAndLossData = (data, departments) => {
  return (
    (data || []).map((d, i) => ({
      ...d,
      Header: { ...d.Header, Department: departments?.[i] },
    })) || []
  );
};

const composeProfitAndLossRequest = (
  departments,
  startDate,
  endDate,
  companyId
) => {
  return Array.from(departments || [], ({ Id: departmentId }) =>
    getProfitAndLossData(startDate, endDate, departmentId, companyId)
  );
};

const sortByMultipleFields = (arr, fields) => {
  return arr.sort((a, b) => {
    for (let field of fields) {
      const check = a[field].toString().localeCompare(b[field].toString());
      if (check !== 0) return check;
    }
    return 0;
  });
};

const distinguishIncomeAtTop = (arr) => {
  const incomeGroup = "Income";
  const incomeAccounts = arr.filter(
    (item) => item["Account Group"] === incomeGroup
  );
  const nonIncomeAccounts = arr.filter(
    (item) => item["Account Group"] !== incomeGroup
  );
  return [...incomeAccounts, ...nonIncomeAccounts];
};

const flattenAndParseData = (profitAndLossDataWithDepartment) => {
  const pusher = [];

  for (const data of profitAndLossDataWithDepartment) {
    pusher.push(...(parse(data || []) || []));
  }

  return distinguishIncomeAtTop(
    sortByMultipleFields(pusher, [
      "Account Name",
      "Accounts",
      "Location",
      "Account Group",
    ])
  );
};

export const useParser = ({ startDate, endDate, handleError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState([]);

  const companyId = JSON.parse(
    getSession(process.env.REACT_APP_TOKEN) || "{}"
  )?.companyId;

  const fetchData = async () => {
    setData([]);

    setIsLoading(true);

    try {
      if (!companyId) throw new Error("No active session found.");

      const data = await getDepartment(companyId);

      const departments = Array.from(
        data.data.json.QueryResponse.Department || [],
        ({ Name, Id }) => ({
          Name,
          Id,
        })
      ).sort((a, b) => a.Name.localeCompare(b.Name));

      const allProfitAndLossData = await Promise.all(
        composeProfitAndLossRequest(departments, startDate, endDate, companyId)
      );

      const profitAndLossDataWithDepartment = mapDepartmentToProfitAndLossData(
        allProfitAndLossData,
        departments
      );

      setData(flattenAndParseData(profitAndLossDataWithDepartment));

      setIsLoading(false);
      setIsError(false);
    } catch (err) {
      setIsLoading(false);
      setIsError(true);

      handleError(err.message);
    }
  };

  return { isLoading, isError, fetchData, data };
};
