const includeHeaderData = (data, columns, refObj, header, group) => {
  collateObject(refObj, columns, data, group, "", header);
};

const collateObject = (refObj, columns, data, group, parentGroup, header) => {
  for (let k = 0; k < data?.length; k++) {
    if (k === 0) {
      refObj["Account Name"] = data[k].value;
      refObj["Accounts"] = data[k].id;
      refObj["Location"] = header.Department.Name;
      refObj["Account Group"] = group || parentGroup;
      refObj["Currency"] = header.Currency;
    } else refObj[columns[k]] = data[k].value;
  }

  delete refObj["Not Specified"];
  delete refObj["Total"];
};

const resetObjectProperties = (obj) => {
  for (let key in obj) {
    delete obj[key];
  }
};

const DataSection = {
  section: "Section",
};

export const parse = (jsonData) => {
  const parsedData = [];
  const header = jsonData.Header;
  const columns = (jsonData.Columns.Column || []).map((c) => {
    return c.ColTitle || c.ColType;
  });
  const rows = jsonData.Rows.Row;

  let parentGroup = "";

  const parseRows = (rows, columns, parsedData, header, eachObj) => {
    for (let i = 0; i < rows.length; i++) {
      if (!rows[i]?.Rows?.Row) continue;

      const subRows = rows[i]?.Rows?.Row || [];
      const group = rows[i].group;

      for (let j = 0; j < subRows.length; j++) {
        const item = subRows[j];
        const type = item.type;

        if (!!!type) break;

        if (type === DataSection.section) {
          const headerData = item.Header.ColData;

          parentGroup = headerData?.[0]?.value || "";

          const refObj = {};

          includeHeaderData(headerData, columns, refObj, header, parentGroup);

          parsedData.push(refObj);

          parseRows([item], columns, parsedData, header, eachObj);
        } else {
          const colData = item.ColData || [];

          collateObject(eachObj, columns, colData, group, parentGroup, header);

          parsedData.push(Object.assign({}, eachObj));

          resetObjectProperties(eachObj);
        }
      }
    }
  };

  const eachObj = {};

  parseRows(rows, columns, parsedData, header, eachObj);

  return parsedData;
};
