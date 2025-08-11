import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

const DELAY_MS = 1000 // Delay between requests to be polite

function parseIntSafe(v) {
  if (!v) return null
  const n = parseInt(v.replace(/[^\d]/g, ""), 10)
  return Number.isFinite(n) ? n : null
}

function hpFromText(t) {
  const hpMatch = t.match(/(\d{2,3})\s?(?:hp|ch|cv)/i)
  const kwMatch = t.match(/(\d{2,3})\s?kw/i)
  const hp = hpMatch ? parseInt(hpMatch[1], 10) : null
  const kw = kwMatch ? parseInt(kwMatch[1], 10) : (hp ? Math.round(hp * 0.7355) : null)
  return { hp, kw }
}

function fuelFromText(t) {
  const s = t.toLowerCase()
  if (/(diesel|dci|dti)/.test(s)) return "Diesel"
  if (/(essence|tce|gpl|lpg|petrol|gasoline)/.test(s)) return "Petrol"
  if (/(hybrid|phev)/.test(s)) return "Hybrid"
  if (/(electric|ev)/.test(s)) return "Electric"
  return null
}

async function fetchHtml(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AutopartScraper/1.0; +https://example.com/bot)',
        'Accept': 'text/html,application/xhtml+xml',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} from ${url}`)
    }
    
    return await response.text()
  } catch (error) {
    console.error(`Error fetching HTML from ${url}:`, error.message)
    throw error
  }
}

async function scrapeBrandData(brandUrl) {
  const urlParts = brandUrl.match(/\/auto\/([a-zA-Z0-9]+)-(\d+)\.html$/)
  if (!urlParts) {
    console.error("Invalid brand URL format. Expected: https://autopart.tn/auto/brand-name-ID.html")
    process.exit(1)
  }
  const brandName = urlParts[1].charAt(0).toUpperCase() + urlParts[1].slice(1) // Capitalize first letter
  const brandId = urlParts[2]

  console.log(`\n🚀 Starting scrape for ${brandName} (ID: ${brandId}) from: ${brandUrl}`)
  
  const allModelsData = []
  
  try {
    console.log('⏳ Fetching main brand page...\n')
    const html = await fetchHtml(brandUrl)
    const $ = cheerio.load(html)
    
    const modelLinks = new Map()
    
    // Find model links on the main brand page
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || ''
      const text = $(el).text().trim()
      
      if (href && text) {
        // Check if it's a model link for this brand
        if (href.includes(`/auto/${brandName.toLowerCase()}-${brandId}/`) && href.endsWith('.html')) {
          const fullUrl = href.startsWith('http') ? href : new URL(href, brandUrl).toString()
          const modelName = text.replace(/\s+/g, ' ').trim()
          
          if (modelName.length > 3 && !modelLinks.has(fullUrl)) {
            modelLinks.set(fullUrl, modelName)
          }
        }
      }
    })

    // Also look for model names in div/span elements that might be clickable containers
    $('.model-item, .car-model, .vehicle-item, [class*="model"], [class*="car"], [class*="vehicle"]').each((index, element) => {
      const $element = $(element)
      const link = $element.find('a').first()
      const href = link.attr('href')
      
      if (href && href.includes(`/auto/${brandName.toLowerCase()}-${brandId}/`)) {
        const text = $element.text().trim() || link.text().trim()
        const fullUrl = href.startsWith('http') ? href : new URL(href, brandUrl).toString()
        const modelName = text.replace(/\s+/g, ' ').trim()
        
        if (modelName.length > 3 && !modelLinks.has(fullUrl)) {
          modelLinks.set(fullUrl, modelName)
        }
      }
    })
    
    if (modelLinks.size === 0) {
      console.warn(`⚠️ No model links found on the main page for ${brandName}. The page structure might have changed or the ID is incorrect.`)
      return
    } else {
      console.log(`✅ Found ${modelLinks.size} candidate model pages for ${brandName}.\n`)
    }

    let processedModels = 0
    for (const [modelUrl, modelName] of modelLinks.entries()) {
      processedModels++
      console.log(`[${processedModels}/${modelLinks.size}] Processing model: ${modelName} (${modelUrl})`)
      
      const modelData = {
        name: modelName,
        motorisations: []
      }

      let modelPageHtml;
      try {
        modelPageHtml = await fetchHtml(modelUrl)
      } catch (e) {
        console.warn(`  ⚠️ Failed to fetch model page ${modelUrl}: ${e.message}`)
        modelData.error = e.message
        allModelsData.push(modelData)
        await new Promise(resolve => setTimeout(resolve, DELAY_MS))
        continue
      }
      const $$ = cheerio.load(modelPageHtml) // Correctly load cheerio for the model page

      // Extract motorisation names only (no links or extra metadata)
      const motors = new Set()

      // Patterns to detect real motorisation-like strings and exclude catalog/product items
      const denylistRegex = /(huile|lubrifi|catalogue|pi[eè]ce|accessoire|outillage|filtr|batterie|essuie|frein|pneu|additif|liquide|lave|amortisseur|radiateur|ampoule|bougie|courroie|distribution|pompe|alternateur|d[ée]marreur|\bcvt\b|bo[iî]te( de vitesses)?|transmission)/i
      const displacementRegex = /(?:^|\s)(\d\.\d)\s?l\b|\b\d{3,4}\s?cc\b/i
      const hpKwRegex = /\b\d{2,3}\s?(?:hp|ch|cv|kw)\b/i
      const engineCodeRegex = /\b(?:dci|tce|td|cdti|hdi|tdi|fsi|tsi|gdi|vti|mpi|i-?vtec|i-?dtec|bluehdi|skyactiv|d-?4d|ecoboost|multijet|edc|dct|bva|bvm|mt)\b/i

      $$('a[href], li, .product-item, .item, .card, .product, .list-group-item').each((_, el) => {
        const $el = $$(el)
        const text = $el.text().trim()
        // We deliberately ignore links; only capture motorisation names
        
        if (!text) return

        // Check for motorisation patterns and exclude obvious catalog/product texts
        const cleaned = text.replace(/\s+/g, ' ').trim()
        if (!cleaned) return

        // Basic length guards to avoid very long product descriptions
        if (cleaned.length < 3 || cleaned.length > 120) return

        if (denylistRegex.test(cleaned)) return

        const isMotorLike = displacementRegex.test(cleaned) || hpKwRegex.test(cleaned) || engineCodeRegex.test(cleaned)
        if (!isMotorLike) return

        // Use only the first line/sentence-like chunk for name
        const motorName = cleaned.split('\n')[0].split('·')[0].split('|')[0].trim()
        if (motorName) motors.add(motorName)
        
      })
      modelData.motorisations = Array.from(motors).slice(0, 50) // Cap to avoid excessive data

      allModelsData.push(modelData)
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
    }
    
    const outputData = {
      brand: brandName,
      models: allModelsData
    }
    
    const filename = `${brandName.toLowerCase()}-data.json`
    fs.writeFileSync(filename, JSON.stringify(outputData, null, 2))
    console.log(`\n🎉 Scrape complete for ${brandName}!`)
    console.log(`💾 Data saved to ${filename}`)

  } catch (error) {
    console.error(`\n❌ Fatal error during scraping for ${brandName}:`, error.message)
  }
}

// Command-line arguments: node scrape-brand-data.js <brandUrl>
const args = process.argv.slice(2)
if (args.length < 1) {
  console.log("Usage: node scripts/scrape-brand-data.js <brandUrl>")
  console.log("Example: node scripts/scrape-brand-data.js https://autopart.tn/auto/nissan-80.html")
  console.log("Example: node scripts/scrape-brand-data.js https://autopart.tn/auto/renault-93.html")
  process.exit(1)
}

const brandUrl = args[0]

scrapeBrandData(brandUrl).catch(console.error)
