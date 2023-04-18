const commentBody = process.argv[2];

const applicationId = process.env.DISCORD_APPLICATION_ID;
const email = process.env.DISCORD_EMAIL;
const password = process.env.DISCORD_PASSWORD;

const visitPreview = commentBody.split("[Visit Preview](")[1].split(")")[0];

const redirectUrl = `${visitPreview}/api/auth`;

(async () => {
  const auth = await fetch("https://discord.com/api/v9/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login: email,
      password: password,
      undelete: false,
      captcha_key: null,
      gift_code_sku_id: null,
    }),
  }).then((res) => res.json());

  const token = auth.token;

  const data = await fetch(
    `https://discord.com/api/v9/applications/${applicationId}`,
    {
      headers: {
        Authorization: token,
      },
    }
  ).then((res) => res.json());
  const current_uris = data.redirect_uris;

  console.log("Token:", token);

  await fetch(`https://discord.com/api/v9/applications/${applicationId}`, {
    method: "PATCH",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      redirect_uris: [...current_uris, redirectUrl],
      rpc_origins: [],
      custom_install_url: null,
      install_params: null,
    }),
  });
})();
