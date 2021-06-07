const crypto = require("crypto");
const iconv = require("iconv-lite");
const NodeRSA = require("node-rsa");
const key = new NodeRSA({ b: 1024 });
const log = require("../log");

exports.createkey = () => {
  const publicDer = key.exportKey("public");
  const privateDer = key.exportKey("pkcs8");
  console.log(publicDer.toString("base64"));
  console.log(privateDer.toString("base64"));
};

/* RSA_TYPE: RSA-SHA256 | RSA-SHA1 */
exports.sign = async (params, privateKey, RSA_TYPE) => {
  const filter = key => key !== "sign" && params[key] !== undefined && params[key] !== null && params[key] !== "";

  const signStr = Object.keys(params)
    .filter(key => filter(key))
    .sort()
    .map(key => {
      let data = params[key];

      if (Array.prototype.toString.call(data) !== "[object String]") {
        data = JSON.stringify(data);
      }

      return `${key}=${iconv.encode(data, "utf-8")}`;
    })
    .join("&");

  // 计算签名
  const sign = crypto
    .createSign(RSA_TYPE)
    .update(signStr, "utf8")
    .sign(privateKey, "base64");
  console.log("签名串:", signStr);
  console.log("签名:", sign);
  return sign;
};

exports.verifySign = async (params, sign, publicKey, RSA_TYPE) => {
  const filter = key => key !== "sign" && key != "signature" && params[key] !== undefined && params[key] !== "";

  const signStr = Object.keys(params)
    .filter(key => filter(key))
    .sort()
    .map(key => {
      let data = params[key];
      if (Array.prototype.toString.call(data) !== "[object String]") {
        data = JSON.stringify(data);
      }
      return `${key}=${iconv.encode(data, "utf-8")}`;
    })
    .join("&");

  const verifier = crypto
    .createVerify(RSA_TYPE)
    .update(signStr, "utf8")
    .verify(publicKey, sign, "base64");

  log.biz.info("wechatOpenCard,open_card,签名验证", params, sign);
  log.biz.info(`wechatOpenCard,open_card,待验证串,${signStr}`);
  log.biz.info(`wechatOpenCard,open_card,验证公钥,${publicKey}`);
  log.biz.info(`wechatOpenCard,open_card,验签通过,${verifier}`);
  return verifier;
};

exports.getSignByHMACSHA256 = (params, key) => {
  console.log("签名验证", params);
  let keyFilter = key => {
    return key !== "sign" && key !== "sign_type" && params[key] !== undefined && params[key] !== "";
  };

  let signStr = Object.keys(params)
    .filter(key => keyFilter(key))
    .sort()
    .map(key => {
      let data = params[key];
      if (Array.prototype.toString.call(data) !== "[object String]") {
        data = JSON.stringify(data);
      }
      return `${key}=${iconv.encode(data, "utf-8")}`;
    })
    .join("&");

  signStr = signStr + "&key=" + key;
  console.log("验签字符串", signStr);

  return crypto
    .createHmac("sha256", key)
    .update(signStr, "utf8")
    .digest("hex")
    .toUpperCase();
};

exports.encrypt = (publicKey, data) => {
  var buffer = Buffer.from(data);
  var encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    },
    buffer
  );
  return encrypted.toString("base64");
};

exports.dencrypt = (privateKey, data) => {
  let buffer = Buffer.from(data, "base64");
  var decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    },
    buffer
  );

  return decrypted.toString("utf8");
};

exports.toQueryString = params => {
  const filter = key => params[key] !== undefined && params[key] !== null && params[key] !== "";

  return Object.keys(params)
    .filter(key => filter(key))
    .sort()
    .map(key => key + "=" + params[key])
    .join("&");
};
