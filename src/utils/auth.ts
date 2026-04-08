export const isTokenExpired = () => {
  const expire = localStorage.getItem("token_expire");

  if (!expire) return true;

  return Date.now() > Number(expire);
};
