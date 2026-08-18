const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../Product data.txt');
const outputPath = path.join(__dirname, '../seed_full_products.sql');

const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split('\n').filter(l => l.trim().length > 0);

// Header is line 0
// We will build a clean SQL script starting with DELETE/TRUNCATE

let sql = `-- ==============================================================================
-- AURA E-Commerce: Full Database Cleanup & Re-seeding Script
-- Generated dynamically from Product data.txt with complete extended metadata
-- ==============================================================================

-- 1. Clear existing products safely
DELETE FROM products;

-- 2. Insert all enriched products
INSERT INTO products (
  id,
  category_id,
  name,
  slug,
  description,
  specs,
  price,
  original_price,
  stock,
  is_featured,
  is_flash_deal,
  flash_deal_ends_at,
  images,
  variants,
  rating_avg,
  reviews_count,
  created_at,
  updated_at,
  badge,
  brand,
  sku,
  target_gender,
  origin_country,
  shelf_life,
  key_benefits,
  highlights,
  usage_instructions,
  care_instructions,
  package_includes,
  delivery_info,
  return_policy
) VALUES
`;

const rows = [];

// Helper CSV parser line by line
function parseCsvLine(text) {
  const result = [];
  let curr = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        curr += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(curr.trim());
      curr = '';
    } else {
      curr += char;
    }
  }
  result.push(curr.trim());
  return result;
}

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line) continue;
  const cols = parseCsvLine(line);
  if (cols.length < 19) continue;

  const [
    id, category_id, name, slug, description, specs, price, original_price,
    stock, is_featured, is_flash_deal, flash_deal_ends_at, imagesStr, variantsStr,
    rating_avg, reviews_count, created_at, updated_at, badge
  ] = cols;

  const cleanName = name.replace(/'/g, "''");
  const cleanSlug = slug.replace(/'/g, "''");

  // Translation helper for Arabic descriptions
  let cleanDesc = description.replace(/'/g, "''");
  if (/[\u0600-\u06FF]/.test(cleanDesc)) {
    if (cleanDesc.includes('شاحن')) cleanDesc = 'Ultra-fast high-efficiency charger designed for rapid device powering.';
    else if (cleanDesc.includes('ماسك')) cleanDesc = 'Overnight hydrating lip and skin mask infused with botanical extracts.';
    else if (cleanDesc.includes('سكرب')) cleanDesc = 'Exfoliating face and body scrub enriched with natural oils for smooth skin.';
    else if (cleanDesc.includes('سبلاش') || cleanDesc.includes('بودي')) cleanDesc = 'Long-lasting refreshing body splash infused with premium fragrance notes.';
    else if (cleanDesc.includes('كاميرا')) cleanDesc = 'Professional 4K streaming webcam with dual noise-canceling microphones.';
    else if (cleanDesc.includes('كابل')) cleanDesc = 'High-durability braided fast-charging cable built to withstand daily use.';
    else if (cleanDesc.includes('بروجيكتور')) cleanDesc = 'Smart 1080P home cinema projector with built-in Dolby spatial audio.';
    else if (cleanDesc.includes('سماعة') || cleanDesc.includes('سماعات')) cleanDesc = 'High-fidelity spatial audio headset with active noise cancellation.';
    else if (cleanDesc.includes('حامل')) cleanDesc = 'Ergonomic aluminum stand with multi-angle height adjustment.';
    else if (cleanDesc.includes('ماوس')) cleanDesc = 'Precision ergonomic wireless mouse designed for long working hours.';
    else if (cleanDesc.includes('سيروم')) cleanDesc = 'Concentrated skin-revitalizing serum formulated with active nutrients.';
    else if (cleanDesc.includes('غسول')) cleanDesc = 'Gentle facial wash designed to cleanse and refresh without dryness.';
    else if (cleanDesc.includes('باور بانك')) cleanDesc = 'High-capacity magnetic wireless power bank with fast-charge delivery.';
    else cleanDesc = 'Premium quality high-performance product engineered for maximum durability and satisfaction.';
  }

  const cleanBadge = badge && badge !== 'NULL' ? `'${badge.replace(/'/g, "''")}'` : 'NULL';
  
  // Format images array
  let imgArr = [];
  try {
    imgArr = JSON.parse(imagesStr);
  } catch (e) {
    imgArr = imagesStr.replace(/^\[|\]$/g, '').split(',').map(s => s.replace(/"/g, '').trim());
  }
  const pgImages = `ARRAY[${imgArr.map(img => `'${img.replace(/'/g, "''")}'`).join(', ')}]`;

  // Format specs & variants jsonb
  const pgSpecs = specs && specs !== '{}' ? `'${specs.replace(/'/g, "''")}'::jsonb` : `'{}'::jsonb`;
  const pgVariants = variantsStr && variantsStr !== '[]' ? `'${variantsStr.replace(/'/g, "''")}'::jsonb` : `'[]'::jsonb`;

  // Target gender detection
  const lowerName = name.toLowerCase();
  const lowerDesc = description.toLowerCase();
  let target_gender = 'unisex';
  if (lowerName.includes('women') || lowerName.includes('girl') || lowerDesc.includes('أنثوي') || lowerDesc.includes('شفايف') || lowerName.includes('mist') || lowerName.includes('peony') || lowerName.includes('rose')) {
    target_gender = 'women';
  } else if (lowerName.includes('men') || lowerName.includes('beard') || lowerDesc.includes('رجالي') || lowerDesc.includes('الذقن') || lowerName.includes('tobacco') || lowerName.includes('leather') || lowerName.includes('spice')) {
    target_gender = 'men';
  }

  // Brand detection
  let brand = 'AURA Official';
  if (lowerName.includes('charger') || lowerName.includes('cable') || lowerName.includes('power bank') || lowerName.includes('usbc')) {
    brand = 'AURA Power';
  } else if (lowerName.includes('headphone') || lowerName.includes('speaker') || lowerName.includes('sound') || lowerName.includes('earbuds') || lowerName.includes('mic')) {
    brand = 'AURA Soundlabs';
  } else if (lowerName.includes('smartwatch') || lowerName.includes('tracker') || lowerName.includes('band')) {
    brand = 'AURA Wearables';
  } else if (lowerName.includes('mist') || lowerName.includes('splash') || lowerName.includes('serum') || lowerName.includes('wash') || lowerName.includes('lotion')) {
    brand = 'AURA Beauty & Care';
  }

  // Generate SKU
  const cleanIdShort = id.substring(0, 6).toUpperCase();
  const sku = `AUR-${brand.split(' ')[1] || 'GEN'}-${cleanIdShort}`;

  // Country & Shelf life
  const origin_country = lowerName.includes('korean') || lowerDesc.includes('كورية') ? 'South Korea' : (brand.includes('Beauty') ? 'France' : 'USA / Designed by AURA');
  const shelf_life = brand.includes('Beauty') ? '36 Months' : '2-Year Official Warranty';

  const key_benefits = `${cleanDesc} Built to highest industrial standards with official AURA warranty.`;
  const highlights = `'["14-Day Free Inspection & Easy Returns", "Express 24-48 Hours Insured Delivery", "100% Original Authentic Quality Guaranteed"]'::jsonb`;
  const usage_instructions = `Follow included user guide for optimal operation and setup.`;
  const care_instructions = `Store in a cool, dry location away from direct sunlight or extreme temperatures.`;
  const packArr = JSON.stringify([cleanName, "Original AURA Protective Box", "User Guide & Warranty Certificate"]);
  const package_includes = `'${packArr.replace(/'/g, "''")}'::jsonb`;
  const delivery_info = `Express 24 - 48 Hours Insured Delivery | Free shipping on orders over $50`;
  const return_policy = `14-Day Inspection & Free Return Guarantee upon delivery.`;

  const flashEnd = flash_deal_ends_at && flash_deal_ends_at !== 'NULL' ? `'${flash_deal_ends_at}'` : 'NULL';
  const origPriceVal = original_price && original_price !== 'NULL' ? original_price : 'NULL';

  const valueRow = `(
  '${id}',
  '${category_id}',
  '${cleanName}',
  '${cleanSlug}',
  '${cleanDesc}',
  ${pgSpecs},
  ${price},
  ${origPriceVal},
  ${stock},
  ${is_featured},
  ${is_flash_deal},
  ${flashEnd},
  ${pgImages},
  ${pgVariants},
  ${rating_avg},
  ${reviews_count},
  '${created_at}',
  '${updated_at}',
  ${cleanBadge},
  '${brand}',
  '${sku}',
  '${target_gender}',
  '${origin_country}',
  '${shelf_life}',
  '${key_benefits}',
  ${highlights},
  '${usage_instructions}',
  '${care_instructions}',
  ${package_includes},
  '${delivery_info}',
  '${return_policy}'
)`;
  rows.push(valueRow);
}

sql += rows.join(',\n') + ';\n';

fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Successfully generated SQL with ${rows.length} products at ${outputPath}`);
