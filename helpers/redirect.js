import { FRONTEND_URL, FRONTEND_STATUS_PATH } from "../config/config.js";

const baseUrl = (FRONTEND_URL || "http://localhost:5500").replace(/\/$/, "");
const statusPath = FRONTEND_STATUS_PATH || "";

export const redirectToFrontend = (res, status, ref, ticketId = null) => {
  let url = `${baseUrl}${statusPath}?reference=${encodeURIComponent(ref)}&status=${encodeURIComponent(status)}`;

  if (status === "success" && ticketId) {
    url += `&ticketId=${encodeURIComponent(ticketId)}`;
  }

  console.log(`Redirecting user to: ${url}`);
  return res.redirect(302, url);
};

export default redirectToFrontend;
