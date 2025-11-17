export const columnWidth = (column) => {
  return (
    {
      "Account Name": 160,
      Location: 10,
      Accounts: 10,
      Currency: 10,
      "Account Group": 128,
    }[column] || 85
  );
};
