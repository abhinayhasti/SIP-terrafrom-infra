import React from "react";

import * as helpers from "../utils/queryDepartment";

import { getSession } from "../utils/clientSession";

import axios from "axios";

const {
  REACT_APP_INTUIT_SANDBOX_URL,
  REACT_APP_INTUIT_PROD_URL,
  REACT_APP_TOKEN,
  REACT_APP_CREDENTIALS,
  REACT_APP_SERVER_URL,
} = process.env;

export const useHttpCall = ({ startDate, endDate }) => {
  const tokenData = JSON.parse(getSession(REACT_APP_TOKEN));

  const companyId = tokenData?.companyId;

  const token = getSession(REACT_APP_TOKEN) || "";

  const conEnv = JSON.parse(getSession(REACT_APP_CREDENTIALS));

  const intuitConUrl = `${
    conEnv?.environment === "sandbox"
      ? REACT_APP_INTUIT_SANDBOX_URL
      : REACT_APP_INTUIT_PROD_URL
  }/v3/company/${companyId || ""}`;

  const credentials = getSession(REACT_APP_CREDENTIALS) || "";

  const getTransactions = async () => {
    const credentials = getSession(REACT_APP_CREDENTIALS) ?? "";

    const url = `${REACT_APP_SERVER_URL}/retrieve-data?url=${intuitConUrl}/reports/TransactionList&value=${credentials}&token=${
      token || ""
    }&start_date=${startDate}&end_date=${endDate}`;

    try {
      if (!helpers.checkUrl(url)) throw new Error("Unsupported url.");

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

  const [isLoading, setIsLoading] = React.useState(false);

  const [transactions, setTransactions] = React.useState([]);

  const getDepartments = async (transactionResponse) => {
    const url = `${REACT_APP_SERVER_URL}/get-data?url=${intuitConUrl}/query&value=${credentials}&token=${
      token || ""
    }`;

    try {
      if (!helpers.checkUrl(url)) throw new Error("Unsupported url.");

      const res = await axios({
        method: "GET",
        url,
        headers: {
          "Cache-Control": "no-cache, no-store",
          "Content-Type": "application/json",
        },
      });

      const payload = res.data.data.json?.QueryResponse?.Department ?? {};

      const {
        buildTransactionUrl,
        asyncQueryBuilder,
        transactionByDepartmentQuery,
        extractDepartments,
        transformTransaction,
      } = helpers;

      const departmentIDs = extractDepartments(payload);

      if (!!departmentIDs) {
        const queries = [];

        departmentIDs.forEach((id) => {
          queries.push(
            asyncQueryBuilder(
              buildTransactionUrl({
                intuitConUrl,
                department: id,
                startDate,
                endDate,
                token,
                serverUrl: REACT_APP_SERVER_URL,
              })
            )
          );
        });

        transactionByDepartmentQuery({
          setTransactions,
          queries,
          setIsLoading,
        });
      } else {
        setTransactions(transformTransaction(transactionResponse));

        setIsLoading(false);
      }
    } catch (err) {
      throw new Error(err);
    }
  };

  const [accounts, setAccounts] = React.useState([]);

  const getAccounts = async () => {
    let url = `${intuitConUrl}/query`;

    try {
      if (!helpers.checkUrl(url)) throw new Error("Unsupported url.");

      const res = await axios({
        method: "POST",
        url: `${REACT_APP_SERVER_URL}/post-data`,
        data: {
          url,
          query: "Select * from Account --STARTPOSITION 1 MAXRESULTS 5",
          values: JSON.parse(getSession(REACT_APP_CREDENTIALS)),
          token: JSON.parse(token),
        },
        headers: {
          "Cache-Control": "no-cache, no-store",
          "Content-Type": "application/json",
        },
      });

      setAccounts(res.data.data.json);

      return res;
    } catch (err) {
      throw new Error(err);
    }
  };

  const fetchData = async ({ handleError }) => {
    setIsLoading(true);

    setAccounts([]);
    setTransactions([]);

    try {
      const [transactionsResponse] = await Promise.all([
        getTransactions(),
        getAccounts(),
      ]);

      await getDepartments(transactionsResponse.data.data.json);
    } catch (err) {
      setIsLoading(false);
      handleError(err);
    }
  };

  return {
    fetchData,
    accounts,
    transactions,
    isLoading,
    setAccounts,
    setTransactions,
  };
};
