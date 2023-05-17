# Tool to add alt text to markdown files

Written by ChatGPT, powered by alttext.ai

Prompt: write a node script that will add alt text to markdown files using alttext.ai

Response: Certainly! To add alt text to Markdown files using alttext.ai, you can utilize the `axios` library to make HTTP requests to the alttext.ai API. Here's an example Node.js script that reads a Markdown file, sends the contents to alttext.ai for alt text generation, and then updates the file with the generated alt text:

... javascript code elided ...

Make sure to replace `'YOUR_API_KEY_HERE'` with your actual API key from alttext.ai. Also, update `'path/to/your/file.md'` with the path to your Markdown file. The script will read the file, generate alt text for each image URL found in the file, and update the Markdown file with the generated alt text.

Please note that you need to have the `axios` library installed in your Node.js project. You can install it by running `npm install axios` in your project directory.

Remember to handle errors and adapt the code as per your specific requirements.
