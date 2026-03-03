import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});
API.interceptors.request.use(
  (req) => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      req.headers.Authorization = `Bearer ${
        JSON.parse(userInfo).token
      }`;
    }
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
