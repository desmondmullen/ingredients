import axios from "axios";

export default {
  queryUSDA: function (id) {
    if (/^\d+$/.test(id)) {
      return axios.get("/api/usda/" + id);
    } else {
      return axios.get("/api/usda/search/" + id);
    }
  }
};