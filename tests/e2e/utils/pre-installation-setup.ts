import { MarketplaceTable } from "../pages/marketplace-table";
const axios = require('axios');
const jsonfile = require('jsonfile');

interface ExtensionUid {
  uid: string;
}

const file = 'data.json';

const savedObj = {};

export const initializeTableApp = async (page) => {
  return new MarketplaceTable(page);
};

// entry page access
export const entryPageFlow = async (savedCredentials, entryPage) => {
  //navigate to stacks page
  const { STACK_API_KEY } = process.env;
  const { contentTypeId, entryUid } = savedCredentials;
  await entryPage.navigateToEntry(STACK_API_KEY, contentTypeId, entryUid);
};

const writeFile = async (obj: any) => {
  jsonfile
    .writeFile(file, obj)
    .then((res) => {
      return res;
    })
    .catch((error) => console.error(error));
};

// get authtoken
export const getAuthToken = async (): Promise<string> => {
  let options = {
    url: `https://${process.env.BASE_API_URL}/v3/user-session`,
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    data: {
      user: {
        email: process.env.CONTENTSTACK_LOGIN,
        password: process.env.CONTENTSTACK_PASSWORD,
      },
    },
  };
  try {
    const result = await axios(options);
    savedObj['authToken'] = result.data.user.authtoken;
    await writeFile(savedObj);
    return result.data.user.authtoken;
  } catch (error) {
    return error;
  }
};

// create content-type
export const createContentType = async (
  authToken: string,
  extension_uid: ExtensionUid[],
  stackApiKey: string | undefined,
) => {
  const generateUid = `Test Content Type_${Math.floor(Math.random() * 10000)}`;
  let options = {
    url: `https://${process.env.BASE_API_URL}/v3/content_types`,
    method: 'POST',
    headers: {
      api_key: stackApiKey,
      authtoken: authToken,
      'Content-type': 'application/json',
    },
    data: {
      content_type: {
        title: generateUid,
        uid: generateUid.replace(/\s/g, '_').toLowerCase(),
        schema: [
          {
            display_name: 'Title',
            uid: 'title',
            data_type: 'text',
            field_metadata: {
              _default: true,
            },
            unique: false,
            mandatory: true,
            multiple: false,
          },
          {
            display_name: 'URL',
            uid: 'url',
            data_type: 'text',
            field_metadata: {
              _default: true,
            },
            unique: false,
            multiple: false,
          },
          {
            display_name: 'Table App',
            uid: 'table_app',
            data_type: 'json',
            extension_uid: extension_uid,
            config: {},
            mandatory: true,
            field_metadata: {
              extension: true,
            },
            multiple: false,
            unique: false,
          },
        ],
      },
    },
  };
  try {
    return (await axios(options)).data;
  } catch (error) {
    return error;
  }
};

// create entry
export const createEntry = async (
  authToken: string,
  contentTypeId: string,
  stackApiKey: string | undefined,
) => {
  let generateTitle = `Test Entry ${Math.floor(Math.random() * 1000)}`;
  let options = {
    url: `https://${process.env.BASE_API_URL}/v3/content_types/${contentTypeId}/entries`,
    params: { locale: 'en-us' },
    method: 'POST',
    headers: {
      api_key: stackApiKey,
      authtoken: authToken,
      'Content-type': 'application/json',
    },
    data: {
      entry: {
        title: generateTitle,
        url: 'test-entry',
      },
    },
  };
  try {
    return (await axios(options)).data.entry;
  } catch (error) {
    return error;
  }
};

// get list of apps/extension IDs
export const getExtensionFieldUid = async (
  authToken: string,
  stackApiKey: string | undefined,
): Promise<ExtensionUid[]> => {
  let options = {
    url: `https://${process.env.BASE_API_URL}/v3/extensions`,
    method: 'GET',
    params: {
      query: {
        type: 'field',
      },
      include_marketplace_extensions: true,
    },
    headers: {
      api_key: stackApiKey,
      authtoken: authToken,
    },
  };
  try {
    let result = await axios(options);
    return result.data.extensions[0].uid;
  } catch (error) {
    return error;
  }
};

export const getInstalledApp = async (authToken: string, appId: string) => {
  let options = {
    url: `https://${process.env.DEVELOPER_HUB_API}/apps/${appId}/installations`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      organization_uid: process.env.CONTENTSTACK_ORGANIZATION_UID,
      authtoken: authToken,
    },
  };
  try {
    return (await axios(options)).data;
  } catch (error) {
    return error;
  }
};

// uninstall app from the stack
export const uninstallApp = async (authToken: string, installId: string) => {
  let options = {
    url: `https://${process.env.DEVELOPER_HUB_API}/installations/${installId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      organization_uid: process.env.CONTENTSTACK_ORGANIZATION_UID,
      authtoken: authToken,
    },
  };
  try {
    return (await axios(options)).data;
  } catch (error) {
    return error;
  }
};

// deletes the created test app during tear down
export const deleteApp = async (token, appId) => {
  let options = {
    url: `https://${process.env.DEVELOPER_HUB_API}/apps/${appId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      organization_uid: process.env.CONTENTSTACK_ORGANIZATION_UID,
      authtoken: token,
    },
  };
  try {
    await axios(options);
  } catch (error) {
    return error;
  }
};

// deletes the created content type during tear down
export const deleteContentType = async (token, contentTypeId) => {
  let options = {
    url: `https://${process.env.BASE_API_URL}/v3/content_types/${contentTypeId}`,
    method: 'DELETE',
    headers: {
      api_key: process.env.STACK_API_KEY,
      authtoken: token,
      'Content-type': 'application/json',
    },
  };
  try {
    await axios(options);
  } catch (error) {
    return error;
  }
};

// create app in developer hub
export const createApp = async (authToken: string) => {
  let options = {
    url: `https://${process.env.DEVELOPER_HUB_API}/apps`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      organization_uid: process.env.CONTENTSTACK_ORGANIZATION_UID,
      authtoken: authToken,
    },
    data: {
      name: `Table App ${Math.floor(Math.random() * 1000)}`,
      target_type: 'stack',
    },
  };
  try {
    console.info(options);
    return (await axios(options)).data.data.uid;
  } catch (error) {
    console.error(error);
    return error;
  }
};

// updating app in developer hub & set baseUrl
export const updateApp = async (authToken: string, appId: string) => {
  let options = {
    url: `https://${process.env.DEVELOPER_HUB_API}/apps/${appId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      organization_uid: process.env.CONTENTSTACK_ORGANIZATION_UID,
      authtoken: authToken,
    },
    data: {
      ui_location: {
        locations: [
          {
            type: 'cs.cm.stack.custom_field',
            meta: [
              {
                name: `Table App ${Math.floor(Math.random() * 1000)}`,
                path: '/field-extension',
                signed: false,
                enabled: true,
                data_type: 'json',
              },
            ],
          },
        ],
        signed: true,
        base_url: `${process.env.APP_BASE_URL}`,
      },
    },
  };
  try {
    console.info(options.data.ui_location.locations[0].meta[0].name);
    return (await axios(options)).data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

// install app in stack & return installation id
export const installApp = async (
  authToken: string,
  appId: string,
  stackApiKey: string | undefined,
) => {
  let options = {
    url: `https://${process.env.DEVELOPER_HUB_API}/apps/${appId}/install`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      organization_uid: process.env.CONTENTSTACK_ORGANIZATION_UID,
      authtoken: authToken,
    },
    data: {
      target_type: 'stack',
      target_uid: stackApiKey,
    },
  };
  try {
    console.info(options);
    const result = await axios(options);
    console.info('success');
    return result.data.data.installation_uid;
  } catch (error) {
    console.error(error);
    return error;
  }
};
