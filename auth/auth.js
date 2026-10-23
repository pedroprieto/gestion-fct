"use strict";

const { CognitoJwtVerifier } = require("aws-jwt-verify");

// Lazily-created verifier (reused across warm Lambda invocations).
let _verifier = null;
function getVerifier() {
  if (!_verifier) {
    _verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      clientId: process.env.COGNITO_CLIENT_ID,
      tokenUse: "access",
    });
  }
  return _verifier;
}

/**
 * Koa middleware that authenticates the request via Cognito.
 *
 * When running behind API Gateway with a Cognito Authorizer the gateway has
 * already validated the token and injected the claims into the Lambda event.
 * @codegenie/serverless-express surfaces those claims at
 *   ctx.request.apiGateway.event.requestContext.authorizer.claims
 * We trust those directly to avoid a redundant network round-trip to the
 * Cognito JWKS endpoint on every request.
 *
 * When running locally (sam local / node start_app.js) there is no gateway, so
 * we fall back to verifying the Bearer token ourselves.
 *
 * In both cases ctx.state.user is populated with:
 *   { name, email, sub, role }
 * where `name` is the Cognito username (= email) used as the DynamoDB PK.
 */
module.exports = async function cognitoAuth(ctx, next) {
  try {
    let claims;

    // ── Path 1: API Gateway injected claims ───────────────────────────────────
    const apiGwClaims =
      ctx.request.apiGateway &&
      ctx.request.apiGateway.event &&
      ctx.request.apiGateway.event.requestContext &&
      ctx.request.apiGateway.event.requestContext.authorizer &&
      ctx.request.apiGateway.event.requestContext.authorizer.claims;

    if (apiGwClaims) {
      claims = apiGwClaims;
    } else {
      // ── Path 2: Local – verify the Bearer token ourselves ─────────────────
      const authHeader = ctx.headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        ctx.status = 401;
        ctx.body = { message: "No autorizado" };
        return;
      }
      const token = authHeader.slice(7);
      claims = await getVerifier().verify(token);
    }

    // With username-based login, `cognito:username` is the NIF the user
    // registered with. That becomes the stable identifier used in DynamoDB PKs.
    const username = (
      claims["cognito:username"] ||
      claims.username ||
      claims.sub
    ).toUpperCase();

    ctx.state.user = {
      name: username, // NIF — used as DynamoDB PK (e.g. "12345678A_curso_periodo")
      email: claims.email,
      sub: claims.sub,
      role: claims["cognito:groups"]
        ? claims["cognito:groups"][0] || "user"
        : "user",
    };

    return next();
  } catch (err) {
    console.error("Auth error:", err.message);
    ctx.status = 401;
    ctx.body = { message: "No autorizado" };
  }
};
