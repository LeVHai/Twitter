export const wrapHandleError = (fnc) => {
  return async (req, res, next) => {
    console.log("hai");
    try {
     await fnc(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
