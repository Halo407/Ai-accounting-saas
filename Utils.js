// utils/getAiResponse.js
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const QWEN_MODEL = 'qwen-max';
const REQUEST_TIMEOUT = 25000; // 25 seconds

/**
 * Fetches a response from the Qwen API based on the provided prompt.
 * @param {string} prompt - The input prompt for the AI model.
 * @returns {Promise<{success: boolean, data?: string, error?: string}>} - Standardized response object.
 */
export async function getAiResponse(prompt) {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return {
      success: false,
      error: 'Invalid prompt: Prompt is required and must be a non-empty string.'
    };
  }

  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: 'Configuration error: QWEN_API_KEY environment variable is not set.'
    };
  }

  const requestBody = {
    model: QWEN_MODEL,
    input: {
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    },
    parameters: {}
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = `HTTP Error: ${response.status} - ${response.statusText}`;
      if (errorBody) {
        errorMessage += `. API Response: ${errorBody}`;
      }
      return {
        success: false,
        error: errorMessage
      };
    }

    const data = await response.json();

    // Attempt to extract the text output from the standard Qwen response structure
    let aiOutputText = '';
    if (data && data.output && data.output.choices && Array.isArray(data.output.choices) && data.output.choices.length > 0) {
      const firstChoice = data.output.choices[0];
      if (firstChoice && typeof firstChoice.message === 'object' && firstChoice.message && typeof firstChoice.message.content === 'string') {
        aiOutputText = firstChoice.message.content;
      } else if (firstChoice && typeof firstChoice.text === 'string') {
        // Fallback to .text if .message.content is not available
        aiOutputText = firstChoice.text;
      }
    }

    if (typeof aiOutputText !== 'string') {
      return {
        success: false,
        error: 'Unexpected API response format: Could not extract text output.'
      };
    }

    return {
      success: true,
      data: aiOutputText.trim()
    };

  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout: The API request took longer than 25 seconds.'
      };
    }
    if (err instanceof SyntaxError) {
      return {
        success: false,
        error: `JSON Parse Error: ${err.message}`
      };
    }
    return {
      success: false,
      error: `Network or Internal Error: ${err.message}`
    };
  }
}
export async function getAiResponse(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') {
    throw new Error('User message is required and must be a string');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch('https://api.awanllm.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen2.5:latest',
        messages: [
          { 
            role: 'system', 
            content: 'You are an AI Accounting assistant...' 
          },
          { 
            role: 'user', 
            content: userMessage 
          }
        ],
        temperature: 0.4,
        max_tokens: 512
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed with status ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from API');
    }

    const aiResponse = data.choices[0].message.content;
    return aiResponse.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
}
