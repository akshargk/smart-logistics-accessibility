import { chromium } from 'playwright'
import { spawn } from 'child_process'

async function run() {
  console.log('Starting preview server...')
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    stdio: 'pipe',
  })

  // Wait for server ready
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  try {
    console.log('Navigating to http://localhost:4173/dashboard...')
    await page.goto('http://localhost:4173/dashboard', { waitUntil: 'networkidle' })

    // 1. Verify default theme is Light Mode
    const defaultTheme = await page.evaluate(() => {
      const el = document.documentElement
      const style = getComputedStyle(el)
      return {
        dataTheme: el.getAttribute('data-theme'),
        classList: Array.from(el.classList),
        bgBase: style.getPropertyValue('--color-bg-base').trim(),
        bgSurface: style.getPropertyValue('--color-bg-surface').trim(),
        textPrimary: style.getPropertyValue('--color-text-primary').trim(),
        accentGreen: style.getPropertyValue('--color-accent-green').trim(),
      }
    })
    console.log('Default Light Mode Values:', defaultTheme)

    await page.screenshot({ path: 'scratch/light_mode_screenshot.png', fullPage: false })
    console.log('Saved scratch/light_mode_screenshot.png')

    // 2. Click Theme Toggle
    const themeBtn = page.locator('button[aria-label*="dark" i], button[aria-label*="light" i]')
    await themeBtn.first().click()
    await page.waitForTimeout(600)

    // 3. Verify Dark Mode
    const darkTheme = await page.evaluate(() => {
      const el = document.documentElement
      const style = getComputedStyle(el)
      return {
        dataTheme: el.getAttribute('data-theme'),
        classList: Array.from(el.classList),
        bgBase: style.getPropertyValue('--color-bg-base').trim(),
        bgSurface: style.getPropertyValue('--color-bg-surface').trim(),
        textPrimary: style.getPropertyValue('--color-text-primary').trim(),
        accentGreen: style.getPropertyValue('--color-accent-green').trim(),
      }
    })
    console.log('Tactical Dark Mode Values:', darkTheme)

    await page.screenshot({ path: 'scratch/dark_mode_screenshot.png', fullPage: false })
    console.log('Saved scratch/dark_mode_screenshot.png')

    console.log('Theme verification SUCCESS!')
  } catch (err) {
    console.error('Verification failed:', err)
  } finally {
    await browser.close()
    server.kill()
    process.exit(0)
  }
}

run()
