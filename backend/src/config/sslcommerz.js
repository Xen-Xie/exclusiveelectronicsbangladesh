export default {
  store_id: process.env.SSLC_STORE_ID,
  store_passwd: process.env.SSLC_STORE_PASS,
  sandbox: process.env.IS_LIVE === false
};
