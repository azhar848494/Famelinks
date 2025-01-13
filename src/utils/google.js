const { google } = require('googleapis');

const config = require('../../config');

const googleConfig = {
    clientId: config.google.clientId,
    clientSecret: config.google.clientSecret,
    redirectUri: config.google.callbackUrl
};

const defaultScope = [
    'https://mail.google.com',
];

/**
 * Create the google auth object which gives us access to talk to google's apis.
 */
const auth = new google.auth.OAuth2(googleConfig);

/**
 * Get a url which will open the google sign-in page and request access to the scope provided (such as calendar events).
 */
exports.getGoogleLoginUrl = () => {
    return auth.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // access type and approval prompt will force a new refresh token to be made each time signs in
        scope: defaultScope
    });
};

exports.getGoogleAccountTokens = (code) => {
    // get the auth "tokens" from the request
    return auth.getToken(code);
};

/**
 * Extract the email and id of the google account from the "code" parameter.
 */
exports.getGoogleAccountFromCode = async (tokens) => {
    // add the tokens to the google api so we have access to the account
    auth.setCredentials(tokens);

    const data = google.oauth2({
        version: 'v2',
        auth
    });
    const userinfo = await data.userinfo.get();
    // return so we can login or sign up the user
    return userinfo;
};

exports.isTokenExpired = async (idToken) => {
    try {
        await auth.verifyIdToken({ idToken });
        return false;
    } catch (error) {
        return true;
    }
};

exports.refreshGoogleTokens = (refresh_token) => {
    auth.setCredentials({ refresh_token });
    return auth.getAccessToken();
};