import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build Tailwind CSS for hotel components only
function buildTailwindForHotel() {
  console.log('Building Tailwind CSS for hotel components...');
  
  // Create a temporary input file with only hotel-related content
  const tempInputPath = path.join(__dirname, '../src/temp-tailwind-input.css');
  const tempOutputPath = path.join(__dirname, '../src/temp-tailwind-output.css');
  
  // Create input file with Tailwind directives
  const inputContent = `
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Hotel-specific custom styles */
@layer utilities {
  .text-hotel-gold {
    color: hsl(43 89% 61%);
  }
  
  .text-hotel-text-secondary {
    color: hsl(215.4 16.3% 46.9%);
  }
  
  .bg-hotel-gold {
    background-color: hsl(43 89% 61%);
  }
  
  .border-hotel-border-light {
    border-color: hsl(214.3 31.8% 91.4%);
  }
}
  `;
  
  fs.writeFileSync(tempInputPath, inputContent);
  
  try {
    // Build Tailwind CSS
    execSync(`npx tailwindcss -i ${tempInputPath} -o ${tempOutputPath} --minify`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    // Read the generated CSS
    const generatedCSS = fs.readFileSync(tempOutputPath, 'utf8');
    
    // Update the Web Component with the generated CSS
    updateWebComponent(generatedCSS);
    
    console.log('✅ Tailwind CSS built and injected into Web Component');
    
  } catch (error) {
    console.error('❌ Error building Tailwind CSS:', error);
  } finally {
    // Clean up temporary files
    if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
    if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
  }
}

function updateWebComponent(cssContent) {
  const webComponentPath = path.join(__dirname, '../src/components/hotel/TailwindHotelWidget.ts');
  
  if (!fs.existsSync(webComponentPath)) {
    console.error('❌ Web Component file not found');
    return;
  }
  
  let webComponentContent = fs.readFileSync(webComponentPath, 'utf8');
  
  // Properly escape the CSS content for template literals
  const escapedCSS = cssContent
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/`/g, '\\`')    // Escape backticks
    .replace(/\$/g, '\\$');  // Escape dollar signs
  
  // Replace the style.textContent with the generated CSS
  const cssRegex = /style\.textContent = `([\s\S]*?)`;/;
  const replacement = `style.textContent = \`${escapedCSS}\`;`;
  
  webComponentContent = webComponentContent.replace(cssRegex, replacement);
  
  fs.writeFileSync(webComponentPath, webComponentContent);
  console.log('✅ Web Component updated with generated CSS');
}

// Run the build
buildTailwindForHotel(); 