import axios from "axios";

export default {
  queryUSDA: function (id) {
    return axios.get("/api/usda/" + id);
  }
};