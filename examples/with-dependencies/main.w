bring cloud;
bring util;

class Utils {
  init() {}
  extern "./utils.js" inflight toUpperCase(value: str): str;
}

let utils = new Utils();

let fn = inflight (message: str) => {
  utils.toUpperCase("world!");
};
