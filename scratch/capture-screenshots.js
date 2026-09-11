import { chromium } from 'playwright'
import { spawn } from 'child_process'
import path from 'path'

async function run() {
  const artifactDir = 'C:/Users/LENOVO/.gemini/antigravity/brain/614a187b-74bc-4951-a262-a92d9a081fe1'
  const lightPath = path.join(artifactDir, 'light_mode.png')
  const darkPath = path.join(artifactDir, 'dark_mode.png')

  console.log('Starting preview server...')
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    stdio: 'pipe',
  })

  await new Promise((resolve) => setTimeout(resolve, 2500))

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } })

  try {
    await page.goto('http://localhost:4173/dashboard', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    console.log('Taking Light Mode screenshot...')
    await page.screenshot({ path: lightPath })
    console.log('Saved:', lightPath)

    // Click Theme Toggle
    const themeBtn = page.locator('button[aria-label*="dark" i], button[aria-label*="light" i]')
    await themeBtn.first().click()
    await page.waitForTimeout(1000)

    console.log('Taking Dark Mode screenshot...')
    await page.screenshot({ path: darkPath })
    console.log('Saved:', darkPath)
  } catch (err) {
    console.error('Error capturing screenshots:', err)
  } finally {
    await browser.close()
    server.kill()
    process.exit(0)
  }
}

run()
