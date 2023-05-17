const fs = require('fs');
const axios = require('axios');
const fncli = require('fncli');

let apiKey

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

// Function to generate alt text using alttext.ai API
async function generateAltText(imageUrl) {
  if (!apiKey) {
    console.log("No api key! Can't generate alt text for", imageUrl);
    return null;
  }

  const apiUrl = 'https://alttext.ai/api/v1/images';

  let retries = 0;
  do {
    try {
      const response = await axios.post(apiUrl, {
        image: {url: imageUrl}
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
      });

      console.log('->', response.data);

      return response.data.alt_text;
    } catch (error) {
      console.error('Error generating alt text:', error, error?.response?.data);
      if (error?.response?.status == 429) {
        // retry later
        console.log("Retrying in 1 second");
        await wait(1000);
        retries++;
      } else {
        return null;
      }
    }
  } while(retries < 5);
}

// Function to add alt text to Markdown image tags
async function addAltTextToMarkdownFile(filePath, baseUrl) {
  try {
    const markdownContent = fs.readFileSync(filePath, 'utf-8');

    // Match Markdown image tags (e.g., ![alt text](image.jpg))
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    let updatedContent = markdownContent;

    let match;
    while ((match = imageRegex.exec(markdownContent)) !== null) {
      const [originalTag, originalAltText, imageUrl] = match;
      if (originalAltText) {
        // Already has alt text
        // console.log(`${filePath} already has alt text: ${originalAltText} ${imageUrl}`);
        continue;
      }
      let absoluteUrl;
      try {
        absoluteUrl = new URL(imageUrl, baseUrl).toString();
      } catch(e) {
        console.error(e);
        console.log('Perhaps you need to set the --base-url?')
        continue;
      }
      const altText = await generateAltText(absoluteUrl);

      if (altText) {
        const updatedTag = `![${altText}](${imageUrl})`;
        updatedContent = updatedContent.replace(originalTag, updatedTag);
      } else {
        console.log(`Failed to generate alt text for: ${match[2]}`);
      }
    }

    if (markdownContent === updatedContent) {
      console.log(`No changes ${filePath}`);
    } else {        
      fs.writeFileSync(filePath, updatedContent, 'utf-8');
      console.log(`Alt text added to ${filePath}`);
    }
  } catch (error) {
    console.error('Error reading or updating file:', error);
  }
}

fncli(async ({a: alttextApiKey=process.env.ALTTEXT_API_KEY, u: baseUrl, test=false}, ...markdownFiles) => {
  apiKey = alttextApiKey;
  if (test) {
    const apiUrl = 'https://alttext.ai/api/v1/account';
    const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
    });   
    console.log(response);
  }
  if (markdownFiles.length == 0) {
    console.log('no files to process');
  }
  for (const markdownFile of markdownFiles) {
    await addAltTextToMarkdownFile(markdownFile, baseUrl);
  }
})
