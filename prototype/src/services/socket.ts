import axios from "axios";

export const socketJoinHandler = async (host: string, data: any) => {
  return new Promise((resolve, reject) => {
    axios
      .post(`${host}/join`, data)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const socketfilterHandler = async (host: string, data: any) => {
  return new Promise((resolve, reject) => {
    axios
      .post(`${host}/filter`, data)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
