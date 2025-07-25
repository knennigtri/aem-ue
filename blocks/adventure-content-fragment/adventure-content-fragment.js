/**
 * Content Fragment Block
 * Displays a single content fragment selected via Universal Editor picker
 * Similar functionality to AdventureDetail.jsx but as a UE block
 */
import { getAdventureByPath } from '../../api/WKND_persistedQueries.js';
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
  const { keys } = contentfragment; // String version of keys in adventureByPath query
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
 */
export default async function decorate(block) {
  // Get the content fragment path
  let cfPath = block.querySelector('a')?.getAttribute('href');
  if (cfPath) {
    cfPath = cfPath.replace(/\.html$/, ''); // Strip .html extension if present (Universal Editor adds this)
  }

  if (!cfPath) {
    showEmpty(block);
    return;
  }

  try {
    // Fetch the content fragment
    const contentFragment = await getAdventureByPath(cfPath);

    if (!contentFragment) {
      showError(block, 'Content fragment not found');
      return;
    }

    block.innerHTML = createDisplay(contentFragment);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Content Fragment block error:', error);
    showError(block, 'Failed to load content fragment');
  }
}
