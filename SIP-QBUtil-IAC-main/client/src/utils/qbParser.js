
  const qbParser = function ({
    setUniqueAcc,
    setTransData,
    transData,
    uniqueAcc,
  }) {


    const months = {
      0: "Jan",
      1: "Feb",
      2: "March",
      3: "April",
      4: "May",
      5: "June",
      6: "July",
      7: "Aug",
      8: "Sept",
      9: "Oct",
      10: "Nov",
      11: "Dec",
    };

    const transformTransaction = () => {
      
      let colData = extractColData();
      let colTitle = extractColTitle();

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
        setUniqueAcc([]);
        setTransData([]);
        return false;
      }
    };


    const formattedRawTransaction=() => {
      return transformTransaction().map((acc) => {
        
        return {
          "account id": acc?.account?.id,
          "account value": acc?.account?.value,
          "amount": acc?.amount?.value,
          "date": new Date(acc?.date?.value)?.toLocaleDateString(),
          "memo/description": acc?.["memo/description"]?.value,
          "name id": acc?.name?.id,
          "name": acc?.name?.value,
          "num": acc?.num?.value,
          "posting": acc?.posting?.value,
          "split id": acc?.split?.id,
          "split": acc?.split?.value,
          "transaction type id": acc?.["transaction type"]?.id,
          "transaction type": acc?.["transaction type"]?.value,
        }
      })
    }



    const extractColTitle = () => {
      if (!transData) return false;

      if (transData) {
        if (!transData["Columns"]) return false;
        
        if (Object?.keys(transData?.Columns).length <= 0) return false;
        
        return transData?.Columns.Column.map((d) => d.ColTitle);
      }
    };

    const extractColData = () => {
      if (!transData) return false;

      if (transData) {
        if (!transData["Rows"]) return false;
        if (Object?.keys(transData?.Rows).length <= 0) return false;

        return transData?.Rows.Row.map((d) => d.ColData);
      }
    };



    const mergeAccountAndRow = () => {
      let mergedDataObject = {};

      const transactionData = transformTransaction();
      const accountData = extractUniqueAccounts();

      if (!transactionData || !accountData) return false;

      for (let i = 0; i < accountData.length; i++) {
        for (let p = 0; p < transactionData.length; p++) {
          if (
            accountData[i].id.some((v) => v === transactionData[p].account.id)
          ) {
            if (!mergedDataObject[accountData[i].account_type]) {
              mergedDataObject[accountData[i].account_type] = [
                transactionData[p],
              ];
            } else {
              mergedDataObject[accountData[i].account_type] = [
                ...mergedDataObject[accountData[i].account_type],
                transactionData[p],
              ];
            }
          }
        }
      }

      return mergedDataObject;
    };

    const transformAccount=() => {


      return uniqueAcc?.QueryResponse.Account?.map((acc) => {
        let payload={
          ...acc,
          "CreateTime": new Date(acc.MetaData.CreateTime)?.toLocaleDateString(),
          "LastUpdatedTime": new Date(acc.MetaData.LastUpdatedTime).toLocaleDateString(),
          "CurrencyValue": acc.CurrencyRef.value,
          "CurrencyName": acc.CurrencyRef.name,
          "ParentRef": acc?.["ParentRef"]?.value,
        };
        delete payload.MetaData;
        delete payload.CurrencyRef;
        return payload; 
      })
    }


    const extractUniqueAccounts = () => {
      let uniqueAccArr = [];
      let uniqueAccObj = {};
      let trackingAcc = {};

      const accounts = uniqueAcc?.QueryResponse.Account?.map((acc) => ({
        id: acc.Id,
        account_type: acc.AccountType,
        currency: acc.CurrencyRef.value,
      }));
      

      for (let i = 0; i < accounts.length; i++) {
        if (!trackingAcc[accounts[i].account_type]) {
          trackingAcc[accounts[i].account_type] = accounts[i].account_type;
          uniqueAccObj["account_type"] = accounts[i].account_type;
          uniqueAccObj["id"] = [accounts[i].id];
          uniqueAccObj["currency"] = accounts[i].currency;
          if (uniqueAccObj) {
            uniqueAccArr.push(uniqueAccObj);
            uniqueAccObj = {};
          }
        } else {
          if (trackingAcc[accounts[i].account_type]) {
            let y = uniqueAccArr.findIndex(
              (d) => d.account_type === accounts[i].account_type
            );
            uniqueAccArr[y].id = [...uniqueAccArr[y].id, accounts[i].id];
          }
        }
      }

      return uniqueAccArr.sort((a, b) =>
        a.account_type > b.account_type ? 1 : -1
      );
    };



    const formatCurrencyPerAccountType = () => {
      let uniqueAccCurrency = {};
      let uniqueAccArr = extractUniqueAccounts();

      for (let i = 0; i < uniqueAccArr.length; i++) {
        if (!uniqueAccCurrency[uniqueAccArr[i].account_type]) {
          uniqueAccCurrency[uniqueAccArr[i].account_type] =
            uniqueAccArr[i].currency;
        } else {
          continue;
        }
      }
      return uniqueAccCurrency;
    };

    const sumByDate = (arg) => {
      Object.entries(arg).forEach(([k, v]) => {
        if (typeof v === "object") {
          let sum = v.reduce((a, b) => (+b.amount.value + +a).toFixed(2), 0);
          arg[k] = sum;
        }
      });
    };

    const formatDataByDate = () => {
      let eachObject = {};
      const pusher = [];

      const mergedAccountsData = mergeAccountAndRow();

      const uniqueAccountCurrency = formatCurrencyPerAccountType();

      if (mergeAccountAndRow) {
        for (let [k, v] of Object.entries(mergedAccountsData)) {
          eachObject["Account Type"] = k;

          let j = v;
          eachObject["Currency"] = uniqueAccountCurrency[k];
          for (let i = 0; i < j.length; i++) {
            let dateIndex = `${
              months[new Date(j[i].date.value).getMonth()]
            } ${new Date(j[i].date.value).getFullYear()}`;

            if (!eachObject[dateIndex]) {
              eachObject[dateIndex] = [j[i]];
            } else {
              eachObject[dateIndex] = [...eachObject[dateIndex], j[i]];
            }
          }

          sumByDate(eachObject);

          pusher.push(eachObject);
          eachObject = {};
        }

        return pusher;
      } else {
        return false;
      }
    };

    const extractPropsFromData = () => {
      let dataFormatByDate = formatDataByDate();
      if (dataFormatByDate) {
        let propsArr = [];
        for (let i = 0; i < dataFormatByDate.length; i++) {
          let iKeys = Object.keys(dataFormatByDate[i]);
          propsArr.push(...iKeys);
        }
        let p = new Set(propsArr);
        const propsSet = [...p];

        const constantArr = propsSet.splice(0, 2);
        const toSortArr = propsSet.sort((a, b) =>
          new Date(a) > new Date(b) ? 1 : -1
        );
        return [...constantArr, ...toSortArr];
      } else {
        return false;
      }
    };

    const redefineObjFromFormattedData = () => {


      let redefinedArr = [];
      let redefinedObj = {};
      let dataFormatByDate = formatDataByDate();

      if (dataFormatByDate) {
        const possibleProps = extractPropsFromData();

        for (let i = 0; i < dataFormatByDate.length; i++) {
          for (let k = 0; k < possibleProps.length; k++) {
            if (!dataFormatByDate[i][possibleProps[k]]) {
              redefinedObj[possibleProps[k]] = "";
            } else {
              redefinedObj[possibleProps[k]] =
                dataFormatByDate[i][possibleProps[k]];
            }
          }
          redefinedArr.push(redefinedObj);
          redefinedObj = {};
        }

        return redefinedArr;

      } else {
        return [];
      }

      
    };

    

    return {
      redefineObjFromFormattedData,
      extractPropsFromData,
      transformTransaction,
      transformAccount,
      formattedRawTransaction
    };
  }

export default qbParser
  