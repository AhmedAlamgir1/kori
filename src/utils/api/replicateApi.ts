interface ImageGenerationOptions {
  prompt: string;
  width?: number;
  height?: number;
  userId?: string;
}

interface ImageGenerationResponse {
  success: boolean;
  data?: {
    imageUrl: string;
    s3Key?: string;
    prompt: string;
    rawImageUrl: string;
    storedInS3: boolean;
  };
  message?: string;
}

/**
 * Generate an image using the backend Replicate API
 * @param options - Image generation options
 * @returns Promise with the generated image URL
 */
export async function generateImage(options: ImageGenerationOptions): Promise<string | null> {
  try {
    const response = await fetch('/api/images/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: options.prompt,
        width: options.width || 512,
        height: options.height || 512,
        userId: options.userId,
      }),
    });

    if (!response.ok) {
      console.error('Failed to generate image:', response.statusText);
      return null;
    }

    const result: ImageGenerationResponse = await response.json();
    
    if (result.success && result.data && result.data.imageUrl) {
      return result.data.imageUrl;
    } else {
      console.error('Invalid response from image generation API:', result);
      return null;
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

/**
 * Generate a profile image based on background description and name
 * @param background - Profile background description
 * @param name - Profile name
 * @returns Promise with the generated image URL
 */
export async function generateProfileImage(background: string, name: string): Promise<string | null> {
  const imagePrompt = `Professional headshot portrait of ${name}, ${background}. Clean, modern, professional photography style, high quality, detailed face, business casual attire, neutral background.`;
  
  return generateImage({
    prompt: imagePrompt,
    width: 512,
    height: 512,
  });
}
