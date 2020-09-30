// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// <msalConfigSnippet>
const msalConfig = {
  auth: {
    clientId: 'e9ab8708-8df0-458f-a649-35975ba3fb84',
    redirectUri: 'http://localhost:3000'
  }
};

const msalRequest = {
  scopes: [
    'user.read',
    'mailboxsettings.read',
    'calendars.readwrite'
  ]
}
// </msalConfigSnippet>
