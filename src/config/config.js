const ftpConfig = {
  host: process.env.FUNCEME_FTP_HOST,
  user: process.env.FUNCEME_FTP_USER,
  password: process.env.FUNCEME_FTP_PASSWORD,
  keepalive: 10000,
  pasvTimeout: 10000,
  connTimeout: 15000,
  port: 21,
};

const funcemeFtpDirectories = {
  directories: {
    station: {
      folder: "pcds",
    },
    pluviometer: {
      folder: "pluviometros",
    },
  },
};

export { ftpConfig, funcemeFtpDirectories };
