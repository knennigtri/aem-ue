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

// item {
//   _path
//   title
//   slug
//   description {
//     json
//     plaintext
//     html
//   }
//   adventureType
//   tripLength
//   activity
//   groupSize
//   difficulty
//   price
//   primaryImage {
//     ... on ImageRef {
//       _path
//       _dynamicUrl
//     }
//   }
//   itinerary {
//     json
//     plaintext
//     html
//   }
// }

function createDisplay(contentFragment) {
  let innerHTML = '';
  // eslint-disable-next-line no-underscore-dangle
  const cfPath = contentFragment._path;
  // eslint-disable-next-line no-underscore-dangle
  const cfPrimaryImagePath = contentFragment.primaryImage._path;

  innerHTML
  += `<div class="headless-wrapper">
    <div class="content-fragment-detail"
        data-aue-resource="urn:aemconnection:${cfPath}/jcr:content/data/master"
        data-aue-type="reference" data-aue-label="Surf Camp in Costa Rica in-context">
        <div class="content-fragment-hero">
            <div class="content-fragment-image">
                <picture>
                    <source srcset="${getAEMHost()}${cfPrimaryImagePath}?width=1200&format=webply&optimize=medium" type="image/webp">
                    <img src="${getAEMHost()}${cfPrimaryImagePath}?width=1200&format=webply&optimize=medium" alt="${contentFragment.title}" loading="lazy" data-aue-type="media" data-aue-prop="primaryImage">
                </picture>
            </div>
            <div class="content-fragment-title-overlay">
                <h1 class="content-fragment-title" data-aue-type="text" data-aue-prop="title">${contentFragment.title}</h1>
            </div>
        </div>
        <div class="content-fragment-content">
            <div class="content-fragment-details-grid">`;
  const details = ['activity', 'difficulty', 'tripLength', 'groupSize', 'price'];
  details.forEach((detail) => {
    if (contentFragment[detail]) {
      innerHTML += `<div class="content-fragment-detail-item">
                        <span class="detail-label">${formatLabel(detail)}</span>
                        <span class="detail-value" data-aue-type="text" data-aue-prop="${detail}">${contentFragment[detail]}</span>
                    </div>`;
    }
  });
  innerHTML += '</div>';
  const descriptionKey = 'description';
  innerHTML
            += `<div class="content-fragment-${descriptionKey}">
                <h2>About This Adventure</h2>
                <div class="content-fragment-${descriptionKey}-content" data-aue-type="richtext" data-aue-prop="${descriptionKey}">
                    ${contentFragment[descriptionKey].html || contentFragment[descriptionKey].plaintext}
                </div>
            </div>`;
  const itineraryKey = 'itinerary';
  innerHTML
            += `<div class="content-fragment-${itineraryKey}">
                <h2>Itinerary</h2>
                <div class="content-fragment-${itineraryKey}-content" data-aue-type="richtext" data-aue-prop="${itineraryKey}">
                    ${contentFragment[itineraryKey].html || contentFragment[itineraryKey].plaintext}
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
