/**
 * Content Fragment Block
 * Displays a single content fragment selected via Universal Editor picker
 * Similar functionality to AdventureDetail.jsx but as a UE block
 */
import { getAdventureByPath, AEM_CONFIG } from '../../api/usePersistedQueries.js';

/**
 * Sets UE attributes on an element
 * Allows for In-context editing of Content Fragments
 */
function setUEAttributes(element, type, property) {
  element.setAttribute('data-aue-type', type); // CFM type
  element.setAttribute('data-aue-prop', property); // CFM name
  return element;
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

  let valueEl = document.createElement('span');
  valueEl.className = 'detail-value';
  valueEl.textContent = value;
  valueEl = setUEAttributes(valueEl, 'text', property);

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

  // Required attributes for CF Editor icon and Content Fragment fields to show up in Properties
  // eslint-disable-next-line no-underscore-dangle
  container.setAttribute('data-aue-resource', `urn:aemconnection:${contentFragment._path}/jcr:content/data/master`);
  container.setAttribute('data-aue-type', 'reference');
  container.setAttribute('data-aue-label', `${contentFragment.title}`); // Optional. Sets Content Tree fragment label

  // Hero section with image and title
  const heroSection = document.createElement('div');
  heroSection.className = 'content-fragment-hero';

  if (contentFragment.primaryImage) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'content-fragment-image';

    const picture = document.createElement('picture');

    // Create WebP source
    const source = document.createElement('source');
    // eslint-disable-next-line no-underscore-dangle
    source.srcset = `${AEM_CONFIG.host}${contentFragment.primaryImage._path}?width=1200&format=webply&optimize=medium`;
    source.type = 'image/webp';

    // Create fallback img
    let img = document.createElement('img');
    // eslint-disable-next-line no-underscore-dangle
    img.src = `${AEM_CONFIG.host}${contentFragment.primaryImage._path}?width=1200&format=webply&optimize=medium`;
    img.alt = contentFragment.title;
    img.loading = 'lazy';
    img = setUEAttributes(img, 'media', 'primaryImage'); // Sets UE attributes

    picture.appendChild(source);
    picture.appendChild(img);
    imageContainer.appendChild(picture);
    heroSection.appendChild(imageContainer);
  }

  // Title overlay
  const titleOverlay = document.createElement('div');
  titleOverlay.className = 'content-fragment-title-overlay';

  let title = document.createElement('h1');
  title.className = 'content-fragment-title';
  title.textContent = contentFragment.title;
  title = setUEAttributes(title, 'text', 'title'); // Sets UE attributes

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

    let descriptionContent = document.createElement('div');
    descriptionContent.className = 'content-fragment-description-content';
    const descriptionHtml = contentFragment.description.html
      || contentFragment.description.plaintext;
    descriptionContent.innerHTML = descriptionHtml;
    descriptionContent = setUEAttributes(descriptionContent, 'richtext', 'description'); // Sets UE attributes

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

    let itineraryContent = document.createElement('div');
    itineraryContent.className = 'content-fragment-itinerary-content';
    const itineraryHtml = contentFragment.itinerary.html
      || contentFragment.itinerary.plaintext;
    itineraryContent.innerHTML = itineraryHtml;
    itineraryContent = setUEAttributes(itineraryContent, 'richtext', 'itinerary'); // Sets UE attributes

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

    let gearContent = document.createElement('div');
    gearContent.className = 'content-fragment-gear-content';
    const gearHtml = contentFragment.gearList.html
      || contentFragment.gearList.plaintext;
    gearContent.innerHTML = gearHtml;
    gearContent = setUEAttributes(gearContent, 'richtext', 'gearList'); // Sets UE attributes

    gearSection.appendChild(gearContent);
    contentSection.appendChild(gearSection);
  }

  container.appendChild(contentSection);
  return container;
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
 * Render the content fragment display
 */
async function renderContentFragment(block, cfPath) {
  try {
    // Fetch the content fragment
    const contentFragment = await getAdventureByPath(cfPath);

    if (!contentFragment) {
      showError(block, 'Content fragment not found');
      return;
    }

    // Clear the block and render the content fragment
    block.textContent = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'headless-wrapper';
    const display = createContentFragmentDisplay(contentFragment);
    wrapper.appendChild(display);
    block.appendChild(wrapper);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Content Fragment block error:', error);
    showError(block, 'Failed to load content fragment');
  }
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

  // Initial render
  await renderContentFragment(block, cfPath);

  // Listen for Universal Editor content changes and re-render
  const handleContentChange = () => {
    // Add a small delay to ensure the content fragment is saved before re-fetching
    setTimeout(() => {
      renderContentFragment(block, cfPath);
    }, 500);
  };

  // Listen for various Universal Editor events
  document.addEventListener('aue:content-patch', handleContentChange);
  document.addEventListener('aue:content-update', handleContentChange);
  document.addEventListener('aue:ui-publish', handleContentChange);
}
