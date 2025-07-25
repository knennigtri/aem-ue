/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

// Configuration for Edge Delivery Services
const AEM_CONFIG = {
  host: 'https://publish-p156903-e1726641.adobeaemcloud.com',
  endpoint: '/graphql/execute.json',
  disableCache: true, // Set to true for development, false for production
};

const wkndContext = {
  endpoint: 'wknd-shared',
  query: {
    adventureByPath: 'adventure-by-path',
  },
};

/**
 * Private, shared function that makes GraphQL requests using native fetch.
 *
 * @param {String} persistedQueryName the fully qualified name of the persisted query
 * @param {*} queryParameters an optional JavaScript object containing query parameters
 * @returns the GraphQL data or an error message
 */
export async function fetchPersistedQuery(persistedQueryName, queryParameters) {
  let data;
  let err;

  try {
    // Build the URL for the persisted query
    let url = `${AEM_CONFIG.host}${AEM_CONFIG.endpoint}/${persistedQueryName}`;

    // Add query variables to URL if provided
    if (queryParameters) {
      Object.entries(queryParameters).forEach(([key, value]) => {
        url += `;${key}=${value}`;
      });
    }
    console.error('Fetched URL', url);

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

/** **********************
 * Vanilla JavaScript functions for use outside React components
 *********************** */

/**
 * Fetch adventure by path - vanilla JavaScript version
 * @param {String} path the content fragment path
 * @returns Promise with adventure data or error
 */
export async function getAdventureByPath(path) {
  const queryParameters = {
    adventurePath: path,
    imageFormat: 'JPG',
    imageSeoName: '',
    imageWidth: 1200,
    imageQuality: 80,
  };

  // Add cache busting for development
  if (AEM_CONFIG.disableCache) {
    queryParameters.timestamp = new Date().getTime();
  }

  const { data, err } = await fetchPersistedQuery(
    `${wkndContext.endpoint}/${wkndContext.query.adventureByPath}`,
    queryParameters,
  );

  if (err) {
    throw new Error(err);
  }

  return data?.adventureByPath?.item;
}
