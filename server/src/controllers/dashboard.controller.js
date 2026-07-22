import landingTemplate from "../templates/landing.template.js";
import loginTemplate from "../templates/login.template.js";
import registerTemplate from "../templates/register.template.js";
import dashboardTemplate from "../templates/dashboard.template.js";

export const getLandingPage = (req, res) => {
  res.setHeader("Content-Type", "text/html");
  return res.send(landingTemplate());
};

export const getLoginPage = (req, res) => {
  res.setHeader("Content-Type", "text/html");
  return res.send(loginTemplate());
};

export const getRegisterPage = (req, res) => {
  res.setHeader("Content-Type", "text/html");
  return res.send(registerTemplate());
};

export const getDashboardPage = (req, res) => {
  res.setHeader("Content-Type", "text/html");
  return res.send(dashboardTemplate());
};
