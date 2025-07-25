/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
import { fetchPersistedQuery } from './aem-gql-connection.js';

const CACHE_BUSTER = false; // Set to true for development, false for production

const WKND_CONTEXT = {
  endpoint: 'wknd-shared',
  query: {
    adventureByPath: 'adventure-by-path',
    adventureBySlug: 'adventure-by-slug',
  },
};

/**
 * Fetch adventure by path - vanilla JavaScript version
 * @param {String} path the content fragment path
 * @returns Promise with adventure data or error
 */
async function getAdventureByPath(path) {
  const queryParameters = {
    adventurePath: path,
    imageFormat: 'JPG',
    imageSeoName: '',
    imageWidth: 1200,
    imageQuality: 80,
  };

  // Add cache busting for development
  if (CACHE_BUSTER) {
    queryParameters.timestamp = new Date().getTime();
  }

  const { data, err } = await fetchPersistedQuery(
    `${WKND_CONTEXT.endpoint}/${WKND_CONTEXT.query.adventureByPath}`,
    queryParameters,
  );

  if (err) {
    throw new Error(err);
  }

  return data?.adventureByPath?.item;
}

/**
 * Fetch adventure by slug - vanilla JavaScript version
 * @param {String} slug the content fragment slug
 * @returns Promise with adventure data or error
 */
async function getAdventureBySlug(slug) {
  const queryParameters = {
    adventureSlug: slug,
  };

  const { data, err } = await fetchPersistedQuery(
    `${WKND_CONTEXT.endpoint}/${WKND_CONTEXT.query.adventureBySlug}`,
    queryParameters,
  );

  if (err) {
    throw new Error(err);
  }

  return data?.adventureBySlug?.item;
}

export { getAdventureByPath, getAdventureBySlug };
