import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Languages, X, Bot, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types/farmer';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  farmerName?: string;
  currentCrops?: Array<{ name: string; status: string; }>;
  recentActivities?: Array<{ type: string; date: string; }>;
}

export default function ChatInterface({ isOpen, onClose, farmerName, currentCrops, recentActivities }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: `നമസ്കാരം ${farmerName ? farmerName.split(' ')[0] : 'farmer'}! I am your Krishi Sakhi, your AI farming companion. I can see you're growing ${currentCrops?.map(c => c.name).join(', ') || 'various crops'}. How can I help you today? You can ask me in English or Malayalam! 🌾`,
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      language: 'english',
      type: 'text'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<'english' | 'malayalam'>('english');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateContextualResponse = (userMessage: string, language: 'english' | 'malayalam') => {
    const message = userMessage.toLowerCase();
    
    // Weather related queries
    if (message.includes('weather') || message.includes('rain') || message.includes('മഴ') || message.includes('കാലാവസ്ഥ')) {
      return language === 'malayalam' 
        ? 'അടുത്ത 3 ദിവസം കനത്ത മഴ പ്രതീക്ഷിക്കുന്നു. കീടനാശിനി തളിക്കുന്നത് ഒഴിവാക്കുക. നല്ല ഡ്രെയിനേജ് ഉറപ്പാക്കുക.'
        : 'Heavy rainfall is expected for the next 3 days. Avoid pesticide spraying and ensure proper drainage in your fields.';
    }
    
    // Rice related queries
    if ((message.includes('rice') || message.includes('നെല്ല്')) && currentCrops?.some(c => c.name.includes('Rice') || c.name.includes('നെല്ല്'))) {
      return language === 'malayalam'
        ? 'നിങ്ങളുടെ നെല്ല് വിളയ്ക്ക് ഇപ്പോൾ ബ്രൗൺ പ്ലാന്റ് ഹോപ്പർ പരിശോധന ആവശ്യമാണ്. തണ്ടിൽ തവിട്ട് പാടുകൾ ഉണ്ടോ എന്ന് നോക്കുക.'
        : 'Your rice crop needs brown plant hopper inspection now. Check for brown spots on stems and take preventive measures.';
    }
    
    // Coconut related queries
    if ((message.includes('coconut') || message.includes('തെങ്ങ്')) && currentCrops?.some(c => c.name.includes('Coconut') || c.name.includes('തെങ്ങ്'))) {
      return language === 'malayalam'
        ? 'തെങ്ങുകൾക്ക് ഇപ്പോൾ ജൈവ വളം പ്രയോഗിക്കാൻ നല്ല സമയമാണ്. ഓരോ മരത്തിന്റെയും ചുവട്ടിൽ കമ്പോസ്റ്റ് ഇടുക.'
        : 'This is a good time to apply organic fertilizer to your coconut trees. Add compost around the base of each tree.';
    }
    
    // Fertilizer queries
    if (message.includes('fertilizer') || message.includes('വളം')) {
      return language === 'malayalam'
        ? 'മഴക്കാലത്ത് രാസവളം പ്രയോഗിക്കുന്നത് ഒഴിവാക്കുക. പകരം ജൈവ വളം ഉപയോഗിക്കുക. നല്ല ഫലം കിട്ടും.'
        : 'Avoid chemical fertilizers during monsoon. Use organic fertilizers instead for better results and soil health.';
    }
    
    // Pest control queries
    if (message.includes('pest') || message.includes('disease') || message.includes('കീടം') || message.includes('രോഗം')) {
      return language === 'malayalam'
        ? 'കീടങ്ങൾക്കെതിരെ നീം എണ്ണ സ്പ്രേ ഉപയോഗിക്കുക. പ്രകൃതിദത്തവും ഫലപ്രദവുമാണ്. ആഴ്ചയിൽ രണ്ടുതവണ തളിക്കുക.'
        : 'Use neem oil spray against pests. It\'s natural and effective. Apply twice a week for best results.';
    }
    
    // Market price queries
    if (message.includes('price') || message.includes('market') || message.includes('വില') || message.includes('മാർക്കറ്റ്')) {
      return language === 'malayalam'
        ? 'ഇന്നത്തെ മാർക്കറ്റ് വില നോക്കാൻ മാർക്കറ്റ് പ്രൈസസ് സെക്ഷൻ ചെക്ക് ചെയ്യുക. നെല്ലിന്റെ വില ഇപ്പോൾ നല്ലതാണ്.'
        : 'Check the Market Prices section for today\'s rates. Rice prices are currently favorable for selling.';
    }
    
    // Activity logging queries
    if (message.includes('activity') || message.includes('log') || message.includes('പ്രവർത്തനം')) {
      return language === 'malayalam'
        ? 'നിങ്ങളുടെ കൃഷി പ്രവർത്തനങ്ങൾ രേഖപ്പെടുത്താൻ ആക്ടിവിറ്റി ലോഗർ ഉപയോഗിക്കുക. ഇത് പുരോഗതി ട്രാക്ക് ചെയ്യാൻ സഹായിക്കും.'
        : 'Use the Activity Logger to record your farming activities. This helps track progress and plan better.';
    }
    
    // Scheme related queries
    if (message.includes('scheme') || message.includes('government') || message.includes('പദ്ധതി') || message.includes('സർക്കാർ')) {
      return language === 'malayalam'
        ? 'PM-KISAN പദ്ധതിയിൽ അപ്ലൈ ചെയ്യാൻ 10 ദിവസം മാത്രം ബാക്കി. സ്കീം അലേർട്സ് സെക്ഷൻ ചെക്ക് ചെയ്യുക.'
        : 'Only 10 days left to apply for PM-KISAN scheme. Check the Schemes section for more government benefits.';
    }
    
    // General farming advice
    const generalResponses = language === 'malayalam' ? [
      'നിങ്ങളുടെ വിള നന്നായി വളരുന്നുണ്ട്. പതിവ് പരിചരണം തുടരുക.',
      'മഴക്കാലത്ത് പ്രത്യേക ശ്രദ്ധ വേണം. വെള്ളം കെട്ടി നിൽക്കാതെ നോക്കുക.',
      'ജൈവ കൃഷി രീതികൾ പിന്തുടരുന്നത് നല്ലതാണ്. മണ്ണിന്റെ ആരോഗ്യം മെച്ചപ്പെടും.',
      'അയൽവാസികളുമായി അനുഭവങ്ങൾ പങ്കുവെക്കുക. കമ്മ്യൂണിറ്റി ഫോറം ഉപയോഗിക്കുക.'
    ] : [
      'Your crops are growing well. Continue with regular care and monitoring.',
      'During monsoon, pay special attention to drainage and pest management.',
      'Following organic farming practices is beneficial for long-term soil health.',
      'Share experiences with fellow farmers in the Community Forum section.'
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  };
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      language,
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentUserMessage = newMessage;
    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: generateContextualResponse(currentUserMessage, language),
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        language,
        type: 'text'
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 800);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would start/stop voice recording
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setNewMessage(language === 'malayalam' ? 'എന്റെ നെല്ലിന് എന്ത് വളം ഇടണം?' : 'What fertilizer should I use for my rice crop?');
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:w-96 sm:max-w-md h-full sm:h-[600px] sm:rounded-t-xl sm:rounded-b-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center relative overflow-hidden">
              <Bot className="h-5 w-5 text-white" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">Krishi Sakhi</h3>
                <Sparkles className="h-3 w-3 text-yellow-500" />
              </div>
              <p className="text-xs text-green-600">AI Assistant • Ready to help</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLanguage(language === 'english' ? 'malayalam' : 'english')}
              className="p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
              title="Switch Language"
            >
              <Languages className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-sm'
                    : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={language === 'malayalam' ? 'നിങ്ങളുടെ ചോദ്യം ടൈപ്പ് ചെയ്യുക...' : 'Type your farming question...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={toggleRecording}
              className={`p-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          {isRecording && (
            <div className="mt-2 flex items-center justify-center space-x-2 text-red-600">
              <div className="flex space-x-1">
                <div className="animate-pulse h-2 w-2 bg-red-600 rounded-full"></div>
                <div className="animate-pulse h-2 w-2 bg-red-600 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                <div className="animate-pulse h-2 w-2 bg-red-600 rounded-full" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-sm">Recording... Speak now</span>
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Language: {language === 'malayalam' ? '🇮🇳 മലയാളം' : '🇬🇧 English'}
          </div>
        </div>
      </div>
    </div>
  );
}