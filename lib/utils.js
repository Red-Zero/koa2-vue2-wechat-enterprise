/* eslint-disable no-undef */
const bytes = require("utf8-bytes");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const qs = require("qs");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const pinyin = require("pinyin");
const log = require("../log");
const requestPromise = require("request-promise");

exports.cutString = (str, len) => {
  let count = 0;
  let resultString = "";
  for (let i = 0; i < str.length; i++) {
    let realLen = bytes(str[i]).length;
    if (count + realLen < len) {
      count += realLen;
      resultString += str[i];
    } else {
      break;
    }
  }
  return resultString;
};

exports.md5 = (str, encoding = "utf8") =>
  crypto
    .createHash("md5")
    .update(str, encoding)
    .digest("hex");

exports.sha256 = (str, key, encoding = "utf8") =>
  crypto
    .createHmac("sha256", key)
    .update(str, encoding)
    .digest("hex");

exports.encryptRSA = (key, hash) => crypto.publicEncrypt(key, new Buffer(hash)).toString("base64");

exports.toQueryString = obj =>
  Object.keys(obj)
    .filter(key => key !== "sign" && key !== "signature" && obj[key] && key != "key")
    .sort()
    .map(key => key + "=" + obj[key])
    .join("&");

exports.generate = (length = 16, type = "string") => {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  if (type == "integer") {
    chars = "0123456789";
  }
  let noceStr = "",
    maxPos = chars.length;
  while (length--) noceStr += chars[(Math.random() * maxPos) | 0];
  return noceStr;
};

exports.sleep = s => {
  return new Promise(function(resovle, reject) {
    setTimeout(() => {
      console.log("***", s);
      resovle();
    }, s);
  });
};

/**
 * aes加密
 * @param data  需要加密的数据
 * @param key   加密key
 * @returns string
 */
exports.encryptAes = (
  data,
  key = "ndgyekhg8235la6f",
  iv = "7354197600124561",
  inEncoding = "utf8",
  outEncoding = "hex"
) => {
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  let sign = cipher.update(data, inEncoding, outEncoding);
  sign += cipher.final(outEncoding);
  sign = new Buffer(sign, outEncoding).toString("base64");
  return sign;
};

/**
 * aes解密
 * @param crypted  密文
 * @param key      解密的key
 * @returns string
 */
exports.decryptAes = (
  crypted,
  key = "ndgyekhg8235la6f",
  iv = "7354197600124561",
  inEncoding = "hex",
  outEncoding = "utf8"
) => {
  crypted = Buffer.from(crypted, "base64").toString(inEncoding);
  const cipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  let sign = cipher.update(crypted, inEncoding, outEncoding);
  sign += cipher.final(outEncoding);
  return sign;
};

/**
 * 球面距离计算
 * @param {Object} params 计算参数 lat1 lng1 点1的经纬度 lat2 lng2 点2的经纬度
 *
 */
exports.sphericalDistance = params => {
  const EARTH_RADIUS = 6378137.0; //单位M
  const { lat1, lng1, lat2, lng2 } = params;
  let f = (((lat1 + lat2) / 2) * Math.PI) / 180;
  let g = (((lat1 - lat2) / 2) * Math.PI) / 180;
  let l = (((lng1 - lng2) / 2) * Math.PI) / 180;

  let sg = Math.pow(Math.sin(g), 2);
  let sl = Math.pow(Math.sin(l), 2);
  let sf = Math.pow(Math.sin(f), 2);

  let s, c, w, r, d, h1, h2;
  let fl = 1 / 298.257;

  s = sg * (1 - sl) + (1 - sf) * sl;
  c = (1 - sg) * (1 - sl) + sf * sl;

  w = Math.atan(Math.sqrt(s / c));
  r = w === 0 ? 0 : Math.sqrt(s * c) / w;
  d = 2 * w * EARTH_RADIUS;
  h1 = (3 * r - 1) / 2 / c;
  h2 = s === 0 ? 0 : (3 * r + 1) / 2 / s;

  return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
};

/**
 * 获取用户token
 * @param {Object} tokenBody 签名数据
 */
exports.generateToken = tokenBody => {
  return jwt.sign(tokenBody, "MGH29eTgBnJJfAN7E");
};

exports.checkPassword = password => {
  if (!/^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!@#$%^&*()-_+=]{6,16}$/.test(password)) {
    return false;
  }
  return true;
};

exports.objectSort = obj => {
  const keys = Object.keys(obj).sort();
  let newObj = {};
  keys.forEach(val => {
    newObj[val] = obj[val];
  });
  return newObj;
};

exports.formatStr = obj => {
  return qs.stringify(obj);
};
exports.getSign = (str, secret) => {
  str += `&app_key=${secret}`;
  const md5 = crypto.createHash("md5");
  return md5
    .update(str)
    .digest("hex")
    .toUpperCase();
};

exports.sign = (params, secret) => {
  let sign = this.getSign(this.formatStr(this.objectSort(params)), secret);
  return sign;
};

exports.urlBase64 = params => {
  return this.formatStr(this.objectSort(params));
};

exports.encryptThreeDESECB = plaintext => {
  const secret = config.sensitiveSecret;
  const key = Buffer.from(secret).slice(0, 24);
  const cipher = crypto.createCipheriv("des-ede3", key, "");
  cipher.setAutoPadding(true); //default true
  let ciph = cipher.update(plaintext, "utf8", "base64");
  ciph += cipher.final("base64");
  return ciph.replace(/\\r/g, "").replace(/\\n/g, "");
};

exports.getRandomStr = len => {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex")
    .slice(0, len);
};

/**
 * 将中文转换成拼音,大写并且以空格隔开
 * @param chinese   需要转换的中文
 * @param config    pinyin包需要的参数, 默认：普通风格，即不带声调；
 * @param separator 转换之后的分隔符, 默认空格
 */
exports.convertChineseToPinyin = (chinese, config, separator = " ") => {
  const defaultConfig = {
    // 普通风格，即不带声调
    style: pinyin.STYLE_NORMAL
  };
  config = config || defaultConfig;
  return pinyin(chinese, config)
    .map(word => word[0])
    .join(separator)
    .toUpperCase();
};

/**
 * 根据身份证号获取年龄
 * @param certNo    身份证号码
 */
exports.getAgeFromCertNo = (certNo = "") => {
  const len = (certNo + "").length;
  if (len === 0) {
    return 0;
  } else if (len != 15 && len != 18) {
    return 0;
  }
  let strBirthday = "";
  //处理18位的身份证号码从号码中得到生日和性别代码
  if (len === 18) {
    strBirthday = certNo.substr(6, 4) + "/" + certNo.substr(10, 2) + "/" + certNo.substr(12, 2);
  }
  if (len == 15) {
    strBirthday = "19" + certNo.substr(6, 2) + "/" + certNo.substr(8, 2) + "/" + certNo.substr(10, 2);
  }
  //时间字符串里，必须是“/”
  var birthDate = new Date(strBirthday);
  var nowDateTime = new Date();
  var age = nowDateTime.getFullYear() - birthDate.getFullYear();
  //再考虑月、天的因素;.getMonth()获取的是从0开始的，这里进行比较，不需要加1
  if (
    nowDateTime.getMonth() < birthDate.getMonth() ||
    (nowDateTime.getMonth() == birthDate.getMonth() && nowDateTime.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

exports.invoke = async (method, uri, body, headers = {}) => {
  log.biz.info({
    message: "发送http请求",
    data: {
      method,
      uri
    }
  });
  return await requestPromise({
    method: method,
    uri: uri,
    body: body,
    headers: {
      "Content-type": "application/json;charset=UTF-8"
    },
    json: true
  });
};
