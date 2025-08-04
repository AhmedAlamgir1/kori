const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
export async function generateImage(options: ImageGenerationOptions): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/images/generate`, {
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
    
    if (result.success && result.data && result.data.imageUrl && typeof result.data.imageUrl === 'string' &&
      result.data.imageUrl.trim() !== '') {
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
export async function generateProfileImage(background: string, name: string): Promise<string | null> {
  const imagePrompt = `Professional headshot portrait of ${name}, ${background}. Clean, modern, professional photography style, high quality,strictly show detailed face only and not body, neutral background.`;
  
  return generateImage({
    prompt: imagePrompt,
    width: 512,
    height: 512,
  });
}
