import { useEffect } from "react";

export const useMount = (cb) => {
  useEffect(cb, []);
};
