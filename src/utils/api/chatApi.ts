const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function createNewChat(accessToken?: string) {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken') || '';
  }
  if (!accessToken) {
    throw new Error('No access token found');
  }
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      status: 'active'
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create chat');
  }
  // The chat object is nested inside data.data.chat
  return data.data.chat;
}

export async function createPromptForChat(chatId: string, promptPayload: any, accessToken?: string) {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken') || '';
  }
  if (!accessToken) {
    throw new Error('No access token found');
  }
  const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/prompts`, {
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
  const response = await fetch(`${API_BASE_URL}/api/chat/all-with-data?status=active`, {
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
export async function saveQuestionsToDatabase(chatId: string, promptId: string, question: { category: string; question: string }, accessToken?: string) {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken') || '';
  }
  if (!accessToken) {
    throw new Error('No access token found');
  }
  const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/prompts/${promptId}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      category: question.category,
      question: question.question
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to save questions');
  }
  return data;
}
export async function sendMessageToChat(chatId: string, messagePayload: {
  promptId?: string;
  message: string;
  role: string;
}, accessToken?: string) {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken') || '';
  }
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(messagePayload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send message');
  }
  return data;
}

interface ChatMessage {
  role: "user" | "assistant" | "system" | "chatgpt";
  content: string;
  timestamp: string;
  _id: string;
}

interface MessageDocument {
  _id: string;
  chatId: string;
  promptId: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
  messages: ChatMessage[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  latestMessageTimestamp: string;
}

export async function getChatMessages(chatId: string, promptId?: string, accessToken?: string) {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken') || '';
  }
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const queryParams = new URLSearchParams({
    page: '1',
    limit: '20'
  });
  if (promptId) {
    queryParams.set('promptId', promptId);
  }

  const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch chat messages');
  }

  // Extract all messages from all message documents and flatten them into a single array
  const allMessages = data.data.messages.reduce((acc: ChatMessage[], doc: MessageDocument) => {
    return [...acc, ...doc.messages];
  }, []);

  return {
    messages: allMessages,
    total: data.data.total,
    pagination: data.data.pagination
  };
}
