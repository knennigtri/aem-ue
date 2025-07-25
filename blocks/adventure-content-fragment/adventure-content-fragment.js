/**
 * Content Fragment Block
 * Displays a single content fragment selected via Universal Editor picker
 * Similar functionality to AdventureDetail.jsx but as a UE block
 */
// MULTI CHANGE: Updated import to use default export (required for multi-fragment support)
import getAdventureByPath from '../../api/WKND_persistedQueries.js';
import { getAEMHost } from '../../api/aem-gql-connection.js';

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

function formatLabel(key) {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
}

function createDisplay(contentfragment) {
  const { keys } = contentfragment;
  const { data } = contentfragment;

  let innerHTML = '';
  // eslint-disable-next-line no-underscore-dangle
  const cfPath = data._path;

  innerHTML
  += `<div class="headless-wrapper">
    <div class="content-fragment-detail"
        data-aue-resource="urn:aemconnection:${cfPath}/jcr:content/data/master"
        data-aue-type="reference" data-aue-label="${data[keys.title]}">`;
  // eslint-disable-next-line no-underscore-dangle
  const cfPrimaryImagePath = data[keys.primaryImage]._path;
  innerHTML
        += `<div class="content-fragment-hero">
            <div class="content-fragment-image">
                <picture>
                    <source srcset="${getAEMHost()}${cfPrimaryImagePath}?width=1200&format=webply&optimize=medium" type="image/webp">
                    <img src="${getAEMHost()}${cfPrimaryImagePath}?width=1200&format=webply&optimize=medium" alt="${data[keys.title]}" loading="lazy" data-aue-type="media" data-aue-prop="${keys.primaryImage}">
                </picture>
            </div>
            <div class="content-fragment-${keys.title}-overlay">
                <h1 class="content-fragment-${keys.title}" data-aue-type="text" data-aue-prop="${keys.title} ">${data[keys.title]}</h1>
            </div>
        </div>
        <div class="content-fragment-content">
            <div class="content-fragment-details-grid">`;
  const details = [keys.activity, keys.difficulty, keys.tripLength, keys.groupSize, keys.price];
  details.forEach((detail) => {
    if (data[detail]) {
      innerHTML += `<div class="content-fragment-detail-item">
                        <span class="detail-label">${formatLabel(detail)}</span>
                        <span class="detail-value" data-aue-type="text" data-aue-prop="${detail}">${data[detail]}</span>
                    </div>`;
    }
  });
  innerHTML
        += `</div>
            <div class="content-fragment-${keys.description}">
                  <h2>About This Adventure</h2>
                  <div class="content-fragment-${keys.description}-content" data-aue-type="richtext" data-aue-prop="${keys.description}">
                      ${data[keys.description].html || data[keys.description].plaintext}
                  </div>
              </div>
              <div class="content-fragment-${keys.itinerary}">
                  <h2>Itinerary</h2>
                  <div class="content-fragment-${keys.itinerary}-content" data-aue-type="richtext" data-aue-prop="${keys.itinerary}">
                      ${data[keys.itinerary].html || data[keys.itinerary].plaintext}
                  </div>
              </div>
          </div>
    </div>
    </div>`;
  return innerHTML;
}

/**
 * Main decoration function
 * MULTI CHANGE: Updated to support multiple content fragments when multi=true is set
 */
export default async function decorate(block) {
  // MULTI CHANGE: Get ALL content fragment paths instead of just the first one
  // This supports multi=true by finding all <a> links in the block
  const cfLinks = Array.from(block.querySelectorAll('a'));

  if (cfLinks.length === 0) {
    showEmpty(block);
    return;
  }

  // MULTI CHANGE: Extract paths from ALL links, not just the first one
  // Map through all links and extract their href attributes
  const cfPaths = cfLinks.map((link) => {
    const path = link.getAttribute('href');
    return path ? path.replace(/\.html$/, '') : null; // Strip .html extension
  }).filter((path) => path !== null);

  if (cfPaths.length === 0) {
    showEmpty(block);
    return;
  }

  try {
    // MULTI CHANGE: Fetch ALL content fragments in parallel instead of just one
    // This improves performance when loading multiple fragments
    const contentFragmentPromises = cfPaths.map((path) => getAdventureByPath(path));
    const contentFragments = await Promise.all(contentFragmentPromises);

    // MULTI CHANGE: Filter out any failed requests to handle partial failures gracefully
    const validFragments = contentFragments.filter((fragment) => fragment !== null);

    if (validFragments.length === 0) {
      showError(block, 'No valid content fragments found');
      return;
    }

    // MULTI CHANGE: Handle both single and multiple fragment display logic
    // This maintains backward compatibility while supporting multi=true
    let combinedHTML = '';

    if (validFragments.length === 1) {
      // Single fragment - use existing layout (backward compatibility)
      combinedHTML = createDisplay(validFragments[0]);
    } else {
      // MULTI CHANGE: Multiple fragments - create a container with grid/list layout
      // Each fragment gets its own container with an index for styling/JS targeting
      combinedHTML = '<div class="content-fragments-container">';
      validFragments.forEach((fragment, index) => {
        combinedHTML += `<div class="content-fragment-item" data-fragment-index="${index}">`;
        combinedHTML += createDisplay(fragment);
        combinedHTML += '</div>';
      });
      combinedHTML += '</div>';
    }

    // MULTI CHANGE: Set the combined HTML for all fragments
    block.innerHTML = combinedHTML;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Content Fragment block error:', error);
    // MULTI CHANGE: Updated error message to reflect multiple fragment support
    showError(block, 'Failed to load content fragments');
  }
}
