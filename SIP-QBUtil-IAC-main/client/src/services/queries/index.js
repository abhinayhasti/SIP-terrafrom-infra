import axiosInstance from "../axiosInstance";

const getDepartment = async (companyId) => {
  try {
    const data = await axiosInstance.get("/departments?companyId=" + companyId);
    return data.data;
  } catch (err) {
    throw new Error(err?.data?.message || "Something went wrong.");
  }
};

const getProfitAndLossData = async (
  startDate,
  endDate,
  departmentId,
  companyId
) => {
  try {
    const data = await axiosInstance.get(
      `/profitAndLoss?start_date=${startDate}&end_date=${endDate}&companyId=${companyId}&department=${departmentId}`
    );
    return data.data.data.json;
  } catch (err) {
    throw new Error(err?.data?.message || "Something went wrong.");
  }
};

export { getDepartment, getProfitAndLossData };
