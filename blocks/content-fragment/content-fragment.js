/**
 * Content Fragment Block
 * Displays a single content fragment selected via Universal Editor picker
 * Similar functionality to AdventureDetail.jsx but as a UE block
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Extract content fragment path from the block configuration
 */
function getContentFragmentPath(block) {
  // Check if there's a content fragment reference in the block data
  const cfReference = block.querySelector('a')?.getAttribute('href');
  if (cfReference) {
    return cfReference;
  }

  // Check for data attributes
  const cfPath = block.dataset.picker || block.dataset.contentFragment;
  if (cfPath) {
    return cfPath;
  }

  // Check for text content that might be a path
  const textContent = block.textContent.trim();
  if (textContent && textContent.startsWith('/content/dam/')) {
    return textContent;
  }

  return null;
}

/**
 * Fallback: Fetch content fragment using GraphQL API
 */
async function fetchContentFragmentViaGraphQL(cfPath) {
  try {
    const query = `
      query GetAdventureByPath($path: String!) {
        adventureByPath(_path: $path) {
          item {
            _path
            title
            slug
            description {
              plaintext
              html
            }
            primaryImage {
              _path
              mimeType
              width
              height
              url
            }
            activity
            adventureType
            tripLength
            groupSize
            difficulty
            price
            gearList {
              plaintext
              html
            }
            itinerary {
              plaintext
              html
            }
          }
        }
      }
    `;

    const response = await fetch('/graphql/execute.json/wknd-shared/adventure-by-path', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { path: cfPath },
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors.map((e) => e.message).join(', ')}`);
    }

    return result.data?.adventureByPath?.item;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch content fragment via GraphQL:', error);
    return null;
  }
}

/**
 * Fetch content fragment data using AEM's Content Fragment API
 */
async function fetchContentFragment(cfPath) {
  if (!cfPath) {
    return null;
  }

  try {
    // Convert CF path to API endpoint
    const apiPath = `${cfPath.replace('/content/dam/', '/api/assets/')}.json`;
    const response = await fetch(apiPath);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch content fragment:', error);

    // Fallback: try GraphQL approach
    return fetchContentFragmentViaGraphQL(cfPath);
  }
}

/**
 * Create a detail item for the details grid
 */
function createDetailItem(label, value, property) {
  const item = document.createElement('div');
  item.className = 'content-fragment-detail-item';

  const labelEl = document.createElement('span');
  labelEl.className = 'detail-label';
  labelEl.textContent = label;

  const valueEl = document.createElement('span');
  valueEl.className = 'detail-value';
  valueEl.textContent = value;
  valueEl.setAttribute('itemtype', 'text');
  valueEl.setAttribute('itemprop', property);

  item.appendChild(labelEl);
  item.appendChild(valueEl);

  return item;
}

/**
 * Create the main content fragment display
 */
function createContentFragmentDisplay(contentFragment) {
  const container = document.createElement('div');
  container.className = 'content-fragment-detail';

  // Add Universal Editor instrumentation to the container
  container.setAttribute('itemscope', '');
  container.setAttribute('itemtype', 'reference');
  // eslint-disable-next-line no-underscore-dangle
  container.setAttribute('itemid', `urn:aemconnection:${contentFragment._path}`);

  // Hero section with image and title
  const heroSection = document.createElement('div');
  heroSection.className = 'content-fragment-hero';

  if (contentFragment.primaryImage) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'content-fragment-image';

    const picture = createOptimizedPicture(
      contentFragment.primaryImage.url,
      contentFragment.title,
      false,
      [{ width: '1200' }],
    );
    imageContainer.appendChild(picture);
    heroSection.appendChild(imageContainer);
  }

  // Title overlay
  const titleOverlay = document.createElement('div');
  titleOverlay.className = 'content-fragment-title-overlay';

  const title = document.createElement('h1');
  title.className = 'content-fragment-title';
  title.textContent = contentFragment.title;
  title.setAttribute('itemtype', 'text');
  title.setAttribute('itemprop', 'title');

  titleOverlay.appendChild(title);
  heroSection.appendChild(titleOverlay);
  container.appendChild(heroSection);

  // Content section
  const contentSection = document.createElement('div');
  contentSection.className = 'content-fragment-content';

  // Adventure details grid
  const detailsGrid = document.createElement('div');
  detailsGrid.className = 'content-fragment-details-grid';

  // Activity
  if (contentFragment.activity) {
    const activityItem = createDetailItem(
      'Activity',
      contentFragment.activity,
      'activity',
    );
    detailsGrid.appendChild(activityItem);
  }

  // Difficulty
  if (contentFragment.difficulty) {
    const difficultyItem = createDetailItem(
      'Difficulty',
      contentFragment.difficulty,
      'difficulty',
    );
    detailsGrid.appendChild(difficultyItem);
  }

  // Trip Length
  if (contentFragment.tripLength) {
    const tripLengthItem = createDetailItem(
      'Duration',
      contentFragment.tripLength,
      'tripLength',
    );
    detailsGrid.appendChild(tripLengthItem);
  }

  // Group Size
  if (contentFragment.groupSize) {
    const groupSizeItem = createDetailItem(
      'Group Size',
      contentFragment.groupSize,
      'groupSize',
    );
    detailsGrid.appendChild(groupSizeItem);
  }

  // Price
  if (contentFragment.price) {
    const priceItem = createDetailItem(
      'Price',
      `$${contentFragment.price}`,
      'price',
    );
    detailsGrid.appendChild(priceItem);
  }

  contentSection.appendChild(detailsGrid);

  // Description
  if (contentFragment.description) {
    const descriptionSection = document.createElement('div');
    descriptionSection.className = 'content-fragment-description';

    const descriptionTitle = document.createElement('h2');
    descriptionTitle.textContent = 'About This Adventure';
    descriptionSection.appendChild(descriptionTitle);

    const descriptionContent = document.createElement('div');
    descriptionContent.className = 'content-fragment-description-content';
    const descriptionHtml = contentFragment.description.html
      || contentFragment.description.plaintext;
    descriptionContent.innerHTML = descriptionHtml;
    descriptionContent.setAttribute('itemtype', 'richtext');
    descriptionContent.setAttribute('itemprop', 'description');

    descriptionSection.appendChild(descriptionContent);
    contentSection.appendChild(descriptionSection);
  }

  // Itinerary
  if (contentFragment.itinerary) {
    const itinerarySection = document.createElement('div');
    itinerarySection.className = 'content-fragment-itinerary';

    const itineraryTitle = document.createElement('h2');
    itineraryTitle.textContent = 'Itinerary';
    itinerarySection.appendChild(itineraryTitle);

    const itineraryContent = document.createElement('div');
    itineraryContent.className = 'content-fragment-itinerary-content';
    const itineraryHtml = contentFragment.itinerary.html
      || contentFragment.itinerary.plaintext;
    itineraryContent.innerHTML = itineraryHtml;
    itineraryContent.setAttribute('itemtype', 'richtext');
    itineraryContent.setAttribute('itemprop', 'itinerary');

    itinerarySection.appendChild(itineraryContent);
    contentSection.appendChild(itinerarySection);
  }

  // Gear List
  if (contentFragment.gearList) {
    const gearSection = document.createElement('div');
    gearSection.className = 'content-fragment-gear';

    const gearTitle = document.createElement('h2');
    gearTitle.textContent = 'What to Bring';
    gearSection.appendChild(gearTitle);

    const gearContent = document.createElement('div');
    gearContent.className = 'content-fragment-gear-content';
    const gearHtml = contentFragment.gearList.html
      || contentFragment.gearList.plaintext;
    gearContent.innerHTML = gearHtml;
    gearContent.setAttribute('itemtype', 'richtext');
    gearContent.setAttribute('itemprop', 'gearList');

    gearSection.appendChild(gearContent);
    contentSection.appendChild(gearSection);
  }

  container.appendChild(contentSection);
  return container;
}

/**
 * Show loading state
 */
function showLoading(block) {
  block.innerHTML = '<div class="content-fragment-loading">Loading content fragment...</div>';
}

/**
 * Show error state
 */
function showError(block, message) {
  block.innerHTML = `<div class="content-fragment-error">Error: ${message}</div>`;
}

/**
 * Show empty/no selection state
 */
function showEmpty(block) {
  const emptyMessage = 'No content fragment selected. Use the Universal Editor to select a content fragment.';
  block.innerHTML = `<div class="content-fragment-empty">${emptyMessage}</div>`;
}

/**
 * Main decoration function
 */
export default async function decorate(block) {
  // Add Universal Editor instrumentation to the block itself
  block.setAttribute('data-aue-resource', 'urn:aem:/content/dam/wknd-shared');
  block.setAttribute('data-aue-type', 'component');
  block.setAttribute('data-aue-label', 'Content Fragment');

  // Get the content fragment path
  const cfPath = getContentFragmentPath(block);

  if (!cfPath) {
    showEmpty(block);
    return;
  }

  // Show loading state
  showLoading(block);

  try {
    // Fetch the content fragment
    const contentFragment = await fetchContentFragment(cfPath);

    if (!contentFragment) {
      showError(block, 'Content fragment not found');
      return;
    }

    // Clear the block and render the content fragment
    block.textContent = '';
    const display = createContentFragmentDisplay(contentFragment);
    block.appendChild(display);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Content Fragment block error:', error);
    showError(block, 'Failed to load content fragment');
  }
}
