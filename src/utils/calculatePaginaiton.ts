const calculatePagination = (options: { page: string; limit: string }) => {
  const page = Number(options.page || 1);
  const limit = Number(options.limit || 10);
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
};

export default calculatePagination;
