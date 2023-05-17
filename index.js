const fs = require('fs');
const axios = require('axios');

// Function to generate alt text using alttext.ai API
async function generateAltText(imageUrl) {
  const apiKey = 'YOUR_API_KEY_HERE';
  const apiUrl = 'https://api.alttext.ai/v1/generate';

  try {
    const response = await axios.post(apiUrl, {
      image_url: imageUrl,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });

    return response.data.alt_text;
  } catch (error) {
    console.error('Error generating alt text:', error.response.data);
    return null;
  }
}

// Function to add alt text to Markdown image tags
async function addAltTextToMarkdownFile(filePath) {
  try {
    const markdownContent = fs.readFileSync(filePath, 'utf-8');

    // Match Markdown image tags (e.g., ![alt text](image.jpg))
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    let updatedContent = markdownContent;

    let match;
    while ((match = imageRegex.exec(markdownContent)) !== null) {
      const originalTag = match[0];
      const altText = await generateAltText(match[2]);

      if (altText) {
        const updatedTag = originalTag.replace(
          match[1],
          `${match[1]} "${altText}"`
        );
        updatedContent = updatedContent.replace(originalTag, updatedTag);
      } else {
        console.log(`Failed to generate alt text for: ${match[2]}`);
      }
    }

    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    console.log(`Alt text added to ${filePath}`);
  } catch (error) {
    console.error('Error reading or updating file:', error);
  }
}

// Specify the Markdown file path
const markdownFilePath = 'path/to/your/file.md';

// Add alt text to Markdown file
addAltTextToMarkdownFile(markdownFilePath);
