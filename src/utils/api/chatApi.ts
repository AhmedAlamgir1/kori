export async function createPromptForChat(chatId: string, promptPayload: any, accessToken?: string) {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken') || '';
  }
  if (!accessToken) {
    throw new Error('No access token found');
  }
  const response = await fetch(`/api/chat/${chatId}/prompts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(promptPayload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create prompt');
  }
  return data;
}
export async function fetchAllUserChats(accessToken?: string) {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken') || '';
  }
  if (!accessToken) {
    throw new Error('No access token found');
  }
  const response = await fetch('/api/chat/all-with-data?status=active', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user chats');
  }
  return data;
} 