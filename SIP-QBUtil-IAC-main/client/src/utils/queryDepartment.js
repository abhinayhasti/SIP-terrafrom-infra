import axios from "axios";

import { getSession } from "./clientSession";

const flatten = (data) => {
  const arr = [];

  for (const v of data) {
    arr.push(...v);
  }

  return arr;
};

export const checkUrl = (url) => {
  return (
    url.includes(process.env.REACT_APP_INTUIT_SANDBOX_URL) ||
    url.includes(process.env.REACT_APP_INTUIT_PROD_URL)
  );
};

export const transactionByDepartmentQuery = ({
  queries,
  setTransactions,
  setIsLoading,
}) => {
  console.log(queries, "here man merged");

  Promise.all(queries)
    .then((responses) => {
      return responses.map((response) =>
        transformTransaction(response.data.data.json)
      );
    })
    .then((transformedData) => {
      transformedData = transformedData.filter(Boolean);

      const flattend = flatten(transformedData);

      setTransactions(flattend);
      setIsLoading(false);

      return flattend;
    })
    .catch((err) => {
      console.log(err, "this is an error man");
      setIsLoading(false);

      throw new Error(err);
    });
};

export const buildTransactionUrl = ({
  intuitConUrl,
  department,
  startDate,
  endDate,
  token,
  serverUrl: REACT_APP_SERVER_URL,
}) => {
  const credentials = getSession(process.env.REACT_APP_CREDENTIALS) ?? "";

  return `${REACT_APP_SERVER_URL}/retrieve-data/department?url=${intuitConUrl}/reports/TransactionList&value=${credentials}&department=${department}&token=${
    token || ""
  }&start_date=${startDate}&end_date=${endDate}`;
};

export const asyncQueryBuilder = async (url) => {
  try {
    const res = await axios({
      method: "GET",
      url,
      headers: {
        "Cache-Control": "no-cache, no-store",
        "Content-Type": "application/json",
      },
    });

    return res;
  } catch (err) {
    throw new Error(err);
  }
};

export const extractDepartments = (departments) => {
  if (Object.keys(departments)?.length <= 0) return false;

  return departments.map((department) => department.Id);
};

export const transformTransaction = (data, id) => {
  let colData = extractColData(data, id);
  let colTitle = extractColTitle(data);

  let formattedData = [];

  let emptyObj = {};

  if (colData && colTitle) {
    for (let i = 0; i < colData.length; i++) {
      for (let k = 0; k < colTitle.length; k++) {
        emptyObj[colTitle[k]?.toLocaleLowerCase()] = colData[i][k];
      }
      formattedData.push(emptyObj);
      emptyObj = {};
    }

    return formattedData;
  } else {
    return false;
  }
};

const extractColTitle = (data) => {
  if (!data) return false;

  if (data) {
    if (!data["Columns"]) return false;

    if (Object?.keys(data?.Columns).length <= 0) return false;

    return data?.Columns.Column.map((d) => d.ColTitle);
  }
};

const extractColData = (data) => {
  if (!data) return false;

  if (data) {
    if (!data["Rows"]) return false;
    if (Object?.keys(data?.Rows).length <= 0) return false;

    return data?.Rows.Row.map((d) => d.ColData);
  }
};
