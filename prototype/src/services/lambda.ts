import axios from "axios";
import { environment } from "../environment";

export const lambdaJoinHandler = async (memory: number, data: any) => {
  return new Promise((resolve, reject) => {
    axios
      .post(`${environment.lambda}/${memory}/join`, data)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const lambdaFilterHandler = async (memory: number, data: any) => {
  return new Promise((resolve, reject) => {
    axios
      .post(`${environment.lambda}/${memory}/filter`, data)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
