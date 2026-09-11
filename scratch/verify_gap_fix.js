import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const metrics = await page.evaluate(() => {
    const mapGrid = document.querySelector('.map-grid');
    const riskMap = mapGrid ? mapGrid.children[0] : null;
    const disasterPanel = mapGrid ? mapGrid.children[1] : null;
    const analyticsGrid = document.querySelector('.analytics-grid');
    const leaflet = document.querySelector('.leaflet-container');

    const getBox = el => el ? {
      rect: el.getBoundingClientRect(),
      computedHeight: window.getComputedStyle(el).height,
    } : null;

    const mapBottom = riskMap ? riskMap.getBoundingClientRect().bottom : 0;
    const analyticsTop = analyticsGrid ? analyticsGrid.getBoundingClientRect().top : 0;

    return {
      mapGrid: getBox(mapGrid),
      riskMap: getBox(riskMap),
      disasterPanel: getBox(disasterPanel),
      leaflet: getBox(leaflet),
      gapBetweenMapAndAnalytics: analyticsTop - mapBottom,
      disasterPanelHeightEqualsRiskMap: disasterPanel ? disasterPanel.getBoundingClientRect().height === riskMap.getBoundingClientRect().height : false,
      leafletHeight: leaflet ? leaflet.getBoundingClientRect().height : 0
    };
  });
  console.log('METRICS:', JSON.stringify(metrics, null, 2));

  // Now scroll 250px and test z-index and navbar overlap
  await page.evaluate(() => window.scrollBy(0, 250));
  await page.waitForTimeout(500);

  const scrollCheck = await page.evaluate(() => {
    const navbar = document.querySelector('header');
    const navZIndex = navbar ? window.getComputedStyle(navbar).zIndex : 0;
    const leaflet = document.querySelector('.leaflet-container');
    const leafletZIndex = leaflet ? window.getComputedStyle(leaflet).zIndex : 0;

    return {
      navZIndex,
      leafletZIndex,
      navbarHigher: parseInt(navZIndex) > parseInt(leafletZIndex),
    };
  });
  console.log('SCROLL CHECK:', JSON.stringify(scrollCheck, null, 2));

  // Capture screenshot of scrolled state
  await page.screenshot({
    path: 'C:/Users/LENOVO/.gemini/antigravity/brain/8d55a8ae-06dc-4d65-934d-18de6c2646e2/scrolled_fixed_verified.png',
    fullPage: false
  });

  // Scroll to show map and analytics together
  await page.evaluate(() => window.scrollTo(0, 180));
  await page.waitForTimeout(500);

  await page.screenshot({
    path: 'C:/Users/LENOVO/.gemini/antigravity/brain/8d55a8ae-06dc-4d65-934d-18de6c2646e2/gap_fixed_verified.png',
    fullPage: false
  });

  console.log('SCREENSHOTS CAPTURED SUCCESSFULLY!');
  await browser.close();
})();
