function getAEMPublish() {
  return 'https://publish-p156903-e1726641.adobeaemcloud.com/';
}

function getAEMAuthor() {
  return 'https://author-p156903-e1726641.adobeaemcloud.com/';
}

// Dynamic switching for Universal Editor (author) and .aem.page/aem.live (publish)
function getAEMHost() {
  if (window.location.hostname.endsWith('adobeaemcloud.com')) {
    return getAEMAuthor();
  }
  return getAEMPublish();
}

/**
 * Private, shared function that makes GraphQL requests using native fetch.
 *
 * @param {String} persistedQueryName the fully qualified name of the persisted query
 * @param {*} queryParameters an optional JavaScript object containing query parameters
 * @returns the GraphQL data or an error message
 */
async function fetchPersistedQuery(persistedQueryName, queryParameters) {
  let data;
  let err;

  try {
    const host = getAEMHost();
    console.debug(`Running GraphQL queries from: ${host}`);
    // Build the URL for the persisted query
    let url = `${host}/graphql/execute.json/${persistedQueryName}`;

    // Add query variables to URL if provided
    if (queryParameters) {
      Object.entries(queryParameters).forEach(([key, value]) => {
        url += `;${key}=${value}`;
      });
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${result.errors.map((e) => e.message).join(', ')}`);
    }

    data = result.data;
  } catch (e) {
    // An error occurred, return the error message
    err = e.message;
    // eslint-disable-next-line no-console
    console.error('GraphQL request failed:', e);
  }

  // Return the GraphQL and any errors
  return { data, err };
}

export {
  getAEMHost, getAEMPublish, getAEMAuthor, fetchPersistedQuery,
};
