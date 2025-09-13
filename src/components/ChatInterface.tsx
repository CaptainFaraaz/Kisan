import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Languages, X, Bot, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types/farmer';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  farmerName?: string;
  currentCrops?: Array<{ name: string; status: string; plantingDate: string; }>;
  recentActivities?: Array<{ type: string; date: string; }>;
}

// Crop-specific templates and knowledge base
const cropTemplates = {
  rice: {
    stages: [
      { name: 'Nursery', days: '0-21', water: '2-3cm', key: 'Seedling establishment' },
      { name: 'Tillering', days: '22-45', water: '3-5cm', key: 'Maximum tillers' },
      { name: 'Panicle Initiation', days: '46-65', water: '5cm', key: 'Reproductive phase' },
      { name: 'Flowering', days: '66-85', water: '3-5cm', key: 'Grain formation' },
      { name: 'Maturity', days: '86-115', water: 'Drain 15 days before harvest', key: 'Grain filling' }
    ],
    fertilizer: [
      { day: 15, type: 'Urea', quantity: '43kg/ha' },
      { day: 21, type: 'Complex', quantity: '25kg/ha' },
      { day: 45, type: 'Urea', quantity: '43kg/ha' },
      { day: 65, type: 'MOP', quantity: '17kg/ha' }
    ],
    pestControl: [
      { day: 15, pest: 'General', spray: 'Neem oil', rate: '5ml/L' },
      { day: 25, pest: 'Leaf folder', spray: 'Chlorpyrifos', rate: '2ml/L' },
      { day: 45, pest: 'Brown plant hopper', spray: 'Imidacloprid', rate: '0.5ml/L' },
      { day: 65, pest: 'Stem borer', spray: 'Cartap hydrochloride', rate: '2g/L' },
      { day: 80, pest: 'Sheath blight', spray: 'Propiconazole', rate: '1ml/L' }
    ]
  },
  coconut: {
    seasons: [
      { name: 'Monsoon', months: 'Jun-Sep', fertilizer: '50kg FYM + 1.3kg Urea + 2kg SSP + 2kg MOP per palm' },
      { name: 'Post-monsoon', months: 'Oct-Jan', fertilizer: '25kg compost + 0.5kg Urea per palm' },
      { name: 'Summer', months: 'Feb-May', fertilizer: '1kg Urea + 1kg MOP per palm' }
    ],
    pests: [
      { pest: 'Rhinoceros beetle', control: 'Pheromone traps + Metarhizium spray' },
      { pest: 'Red palm weevil', control: 'Trunk injection + Chlorpyrifos' },
      { pest: 'Coconut mite', control: 'Sulfur spray 3g/L' }
    ]
  },
  tomato: {
    stages: [
      { name: 'Nursery', days: '0-25', activity: 'Seed sowing to transplant ready' },
      { name: 'Transplant', days: '26-40', activity: 'Field establishment' },
      { name: 'Flowering', days: '41-65', activity: 'Flower induction and fruit set' },
      { name: 'Fruiting', days: '66-120', activity: 'Fruit development and harvest' }
    ],
    schedule: [
      { day: 7, activity: 'First irrigation after transplant' },
      { day: 15, activity: 'NPK 19:19:19 @ 5g/L foliar spray' },
      { day: 30, activity: 'Staking and pruning' },
      { day: 45, activity: 'Calcium spray 2g/L for fruit quality' },
      { day: 60, activity: 'Monitor fruit borer, apply Bt spray' }
    ]
  }
};

const krishiSakhiAI = {
  identifyCrop: (message: string, crops: any[]) => {
    const msg = message.toLowerCase();
    
    // Check for specific crop mentions
    if (msg.includes('rice') || msg.includes('നെല്ല്') || msg.includes('paddy')) {
      return crops.find(c => c.name.toLowerCase().includes('rice') || c.name.includes('നെല്ല്'));
    }
    if (msg.includes('coconut') || msg.includes('തെങ്ങ്')) {
      return crops.find(c => c.name.toLowerCase().includes('coconut') || c.name.includes('തെങ്ങ്'));
    }
    if (msg.includes('tomato') || msg.includes('തക്കാളി')) {
      return crops.find(c => c.name.toLowerCase().includes('tomato') || c.name.includes('തക്കാളി'));
    }
    if (msg.includes('pepper') || msg.includes('കുരുമുളക്')) {
      return crops.find(c => c.name.toLowerCase().includes('pepper') || c.name.includes('കുരുമുളക്'));
    }
    if (msg.includes('banana') || msg.includes('വാഴ')) {
      return crops.find(c => c.name.toLowerCase().includes('banana') || c.name.includes('വാഴ'));
    }
    
    return null;
  },

  getCropAge: (plantingDate: string) => {
    const planted = new Date(plantingDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - planted.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  getRiceStage: (days: number) => {
    if (days <= 21) return cropTemplates.rice.stages[0];
    if (days <= 45) return cropTemplates.rice.stages[1];
    if (days <= 65) return cropTemplates.rice.stages[2];
    if (days <= 85) return cropTemplates.rice.stages[3];
    return cropTemplates.rice.stages[4];
  },

  generateResponse: (message: string, crops: any[], language: string, farmerName: string) => {
    const msg = message.toLowerCase();
    const identifiedCrop = krishiSakhiAI.identifyCrop(message, crops);
    
    // Rice-specific responses
    if (identifiedCrop && (identifiedCrop.name.toLowerCase().includes('rice') || identifiedCrop.name.includes('നെല്ല്'))) {
      const cropAge = krishiSakhiAI.getCropAge(identifiedCrop.plantingDate);
      const stage = krishiSakhiAI.getRiceStage(cropAge);
      
      if (msg.includes('fertilizer') || msg.includes('വളം')) {
        const nextFertilizer = cropTemplates.rice.fertilizer.find(f => f.day > cropAge);
        return language === 'malayalam' 
          ? `🌾 നെല്ല് - ${cropAge} ദിവസം പഴക്കം\n\n📅 നിലവിലെ ഘട്ടം: ${stage.name} (${stage.days} ദിവസം)\n💊 അടുത്ത വളം: ${nextFertilizer ? `ദിവസം ${nextFertilizer.day} - ${nextFertilizer.type} ${nextFertilizer.quantity}` : 'വളം പൂർത്തിയായി'}\n💧 ജലനിരപ്പ്: ${stage.water}\n\n⚠️ മഴക്കാലത്ത് രാസവളം ഒഴിവാക്കുക`
          : `🌾 Rice - ${cropAge} days old\n\n📅 Current Stage: ${stage.name} (${stage.days} days)\n💊 Next Fertilizer: ${nextFertilizer ? `Day ${nextFertilizer.day} - ${nextFertilizer.type} ${nextFertilizer.quantity}` : 'Fertilizer schedule complete'}\n💧 Water Level: ${stage.water}\n\n⚠️ Avoid chemical fertilizers during heavy rain`;
      }
      
      if (msg.includes('pest') || msg.includes('disease') || msg.includes('കീടം') || msg.includes('രോഗം')) {
        const nextSpray = cropTemplates.rice.pestControl.find(p => p.day > cropAge);
        return language === 'malayalam'
          ? `🌾 നെല്ല് കീട നിയന്ത്രണം - ${cropAge} ദിവസം\n\n🐛 അടുത്ത സ്പ്രേ: ${nextSpray ? `ദിവസം ${nextSpray.day}\n${nextSpray.pest} - ${nextSpray.spray} @ ${nextSpray.rate}` : 'സ്പ്രേ ഷെഡ്യൂൾ പൂർത്തിയായി'}\n\n📋 ഇപ്പോൾ ചെയ്യേണ്ടത്:\n• ഇലകളിൽ തവിട്ട് പാടുകൾ പരിശോധിക്കുക\n• വെള്ളം കെട്ടി നിൽക്കാതെ നോക്കുക\n• രാവിലെ 6-8 മണിക്ക് സ്പ്രേ ചെയ്യുക`
          : `🌾 Rice Pest Control - ${cropAge} days\n\n🐛 Next Spray: ${nextSpray ? `Day ${nextSpray.day}\n${nextSpray.pest} - ${nextSpray.spray} @ ${nextSpray.rate}` : 'Spray schedule complete'}\n\n📋 Immediate Actions:\n• Check for brown spots on leaves\n• Ensure proper drainage\n• Spray early morning 6-8 AM`;
      }
      
      if (msg.includes('water') || msg.includes('irrigation') || msg.includes('വെള്ളം')) {
        return language === 'malayalam'
          ? `🌾 നെല്ല് ജല പരിപാലനം - ${cropAge} ദിവസം\n\n💧 നിലവിലെ ആവശ്യം: ${stage.water}\n📅 ഘട്ടം: ${stage.name}\n\n⚠️ പ്രധാന കാര്യങ്ങൾ:\n• ${stage.key}\n• മഴയുണ്ടെങ്കിൽ അധിക വെള്ളം ഒഴുക്കി വിടുക\n• വെള്ളം മലിനമാകാതെ നോക്കുക\n\n🔄 അടുത്ത പരിശോധന: 3 ദിവസം കഴിഞ്ഞ്`
          : `🌾 Rice Water Management - ${cropAge} days\n\n💧 Current Requirement: ${stage.water}\n📅 Stage: ${stage.name}\n\n⚠️ Key Points:\n• ${stage.key}\n• Drain excess water during heavy rain\n• Keep water clean and fresh\n\n🔄 Next Check: After 3 days`;
      }
    }
    
    // Coconut-specific responses
    if (identifiedCrop && (identifiedCrop.name.toLowerCase().includes('coconut') || identifiedCrop.name.includes('തെങ്ങ്'))) {
      const currentMonth = new Date().getMonth() + 1;
      let season = cropTemplates.coconut.seasons[0]; // Default to monsoon
      
      if (currentMonth >= 10 || currentMonth <= 1) season = cropTemplates.coconut.seasons[1]; // Post-monsoon
      else if (currentMonth >= 2 && currentMonth <= 5) season = cropTemplates.coconut.seasons[2]; // Summer
      
      if (msg.includes('fertilizer') || msg.includes('വളം')) {
        return language === 'malayalam'
          ? `🥥 തെങ്ങ് വള പരിപാലനം\n\n📅 സീസൺ: ${season.name} (${season.months})\n💊 വളം: ${season.fertilizer}\n\n📋 പ്രയോഗ രീതി:\n• മരത്തിന്റെ ചുവട്ടിൽ 2 മീറ്റർ ചുറ്റളവിൽ\n• 15-20 സെ.മീ ആഴത്തിൽ കുഴിച്ച് ഇടുക\n• വളം ഇട്ട ശേഷം വെള്ളം നനയ്ക്കുക\n\n🔄 അടുത്ത വളം: 3 മാസം കഴിഞ്ഞ്`
          : `🥥 Coconut Fertilizer Management\n\n📅 Season: ${season.name} (${season.months})\n💊 Fertilizer: ${season.fertilizer}\n\n📋 Application Method:\n• Apply in 2m radius around palm\n• Dig 15-20cm deep and apply\n• Water thoroughly after application\n\n🔄 Next Application: After 3 months`;
      }
      
      if (msg.includes('pest') || msg.includes('കീടം')) {
        const pestInfo = cropTemplates.coconut.pests[0]; // Rhinoceros beetle most common
        return language === 'malayalam'
          ? `🥥 തെങ്ങ് കീട നിയന്ത്രണം\n\n🐛 പ്രധാന കീടം: ${pestInfo.pest}\n💊 നിയന്ത്രണം: ${pestInfo.control}\n\n📋 ഇപ്പോൾ ചെയ്യേണ്ടത്:\n• കിരീടത്തിൽ ദ്വാരങ്ങൾ പരിശോധിക്കുക\n• ഫെറോമോൺ ട്രാപ്പുകൾ സ്ഥാപിക്കുക\n• ചത്ത ഇലകൾ നീക്കം ചെയ്യുക\n\n⚠️ മാസത്തിൽ ഒരിക്കൽ പരിശോധിക്കുക`
          : `🥥 Coconut Pest Control\n\n🐛 Major Pest: ${pestInfo.pest}\n💊 Control: ${pestInfo.control}\n\n📋 Immediate Actions:\n• Check crown for holes\n• Install pheromone traps\n• Remove dead fronds\n\n⚠️ Monthly inspection required`;
      }
    }
    
    // Tomato-specific responses
    if (identifiedCrop && (identifiedCrop.name.toLowerCase().includes('tomato') || identifiedCrop.name.includes('തക്കാളി'))) {
      const cropAge = krishiSakhiAI.getCropAge(identifiedCrop.plantingDate);
      let stage = cropTemplates.tomato.stages[0];
      
      if (cropAge > 25 && cropAge <= 40) stage = cropTemplates.tomato.stages[1];
      else if (cropAge > 40 && cropAge <= 65) stage = cropTemplates.tomato.stages[2];
      else if (cropAge > 65) stage = cropTemplates.tomato.stages[3];
      
      if (msg.includes('disease') || msg.includes('pest') || msg.includes('രോഗം')) {
        return language === 'malayalam'
          ? `🍅 തക്കാളി രോഗ നിയന്ത്രണം - ${cropAge} ദിവസം\n\n📅 ഘട്ടം: ${stage.name} (${stage.days} ദിവസം)\n\n🐛 പ്രധാന രോഗങ്ങൾ:\n• ബ്ലൈറ്റ് - കോപ്പർ സ്പ്രേ 2g/L\n• ഫ്രൂട് ബോറർ - Bt സ്പ്രേ 1g/L\n• വൈറൽ - രോഗബാധിത ചെടികൾ നീക്കം ചെയ്യുക\n\n📋 പ്രതിരോധം:\n• നല്ല വായു സഞ്ചാരം ഉറപ്പാക്കുക\n• അധിക വെള്ളം ഒഴിവാക്കുക\n• സായാഹ്നത്തിൽ സ്പ്രേ ചെയ്യുക`
          : `🍅 Tomato Disease Control - ${cropAge} days\n\n📅 Stage: ${stage.name} (${stage.days} days)\n\n🐛 Major Diseases:\n• Blight - Copper spray 2g/L\n• Fruit Borer - Bt spray 1g/L\n• Viral - Remove infected plants\n\n📋 Prevention:\n• Ensure good air circulation\n• Avoid over-watering\n• Spray in evening hours`;
      }
    }
    
    // General farming queries
    if (msg.includes('weather') || msg.includes('rain') || msg.includes('മഴ') || msg.includes('കാലാവസ്ഥ')) {
      return language === 'malayalam' 
        ? `🌦️ കാലാവസ്ഥാ മുന്നറിയിപ്പ്\n\nഅടുത്ത 3 ദിവസം കനത്ത മഴ പ്രതീക്ഷിക്കുന്നു\n\n⚠️ ഇപ്പോൾ ചെയ്യേണ്ടത്:\n• കീടനാശിനി തളിക്കുന്നത് നിർത്തുക\n• വയലിൽ നല്ല ഡ്രെയിനേജ് ഉറപ്പാക്കുക\n• വിളകൾ കെട്ടി താങ്ങുക\n• വളം പ്രയോഗം മാറ്റിവെക്കുക\n\n🔄 മഴ കഴിഞ്ഞ് 2 ദിവസം കഴിഞ്ഞ് പ്രവർത്തനങ്ങൾ പുനരാരംഭിക്കുക`
        : `🌦️ Weather Alert\n\nHeavy rainfall expected for next 3 days\n\n⚠️ Immediate Actions:\n• Stop pesticide spraying\n• Ensure proper field drainage\n• Provide crop support/staking\n• Postpone fertilizer application\n\n🔄 Resume activities 2 days after rain stops`;
    }
    
    if (msg.includes('market') || msg.includes('price') || msg.includes('വില')) {
      return language === 'malayalam'
        ? `💰 മാർക്കറ്റ് വിവരങ്ങൾ\n\n📈 ഇന്നത്തെ വില (കോട്ടയം മണ്ടി):\n• നെല്ല്: ₹2,850/ക്വിന്റൽ (+1.8%)\n• തെങ്ങ്: ₹12/എണ്ണം (+4.3%)\n• കുരുമുളക്: ₹45,000/ക്വിന്റൽ (-3.2%)\n\n📋 വിൽപ്പന നുറുങ്ങുകൾ:\n• നെല്ലിന് നല്ല വില, വിൽക്കാൻ നല്ല സമയം\n• തെങ്ങിന്റെ വില കൂടുന്നു\n• കുരുമുളക് വില കുറഞ്ഞു, കാത്തിരിക്കുക\n\n🔄 അടുത്ത അപ്ഡേറ്റ്: നാളെ രാവിലെ 8 മണിക്ക്`
        : `💰 Market Information\n\n📈 Today's Prices (Kottayam Mandi):\n• Rice: ₹2,850/quintal (+1.8%)\n• Coconut: ₹12/piece (+4.3%)\n• Pepper: ₹45,000/quintal (-3.2%)\n\n📋 Selling Tips:\n• Good rice prices, ideal time to sell\n• Coconut prices rising\n• Pepper prices down, wait for better rates\n\n🔄 Next Update: Tomorrow 8 AM`;
    }
    
    // Default contextual response
    const farmerFirstName = farmerName.split(' ')[0];
    const cropNames = crops.map(c => c.name).join(', ');
    
    return language === 'malayalam'
      ? `നമസ്കാരം ${farmerFirstName}! 🙏\n\nനിങ്ങളുടെ വിളകൾ: ${cropNames}\n\n🤔 എനിക്ക് സഹായിക്കാൻ കഴിയുന്ന കാര്യങ്ങൾ:\n• വിള-നിർദ്ദിഷ്ട ഉപദേശം\n• വളം & കീടനാശിനി ഷെഡ്യൂൾ\n• രോഗ നിർദ്ദാനം\n• കാലാവസ്ഥാ മുന്നറിയിപ്പ്\n• മാർക്കറ്റ് വിലകൾ\n\n💬 ഉദാഹരണം: "എന്റെ നെല്ലിന് എന്ത് വളം വേണം?" എന്ന് ചോദിക്കുക`
      : `Hello ${farmerFirstName}! 🙏\n\nYour crops: ${cropNames}\n\n🤔 I can help you with:\n• Crop-specific guidance\n• Fertilizer & pesticide schedules\n• Disease diagnosis\n• Weather alerts\n• Market prices\n\n💬 Example: Ask "What fertilizer does my rice need?"`;
  }
};

export default function ChatInterface({ isOpen, onClose, farmerName, currentCrops, recentActivities }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: krishiSakhiAI.generateResponse('hello', currentCrops || [], 'english', farmerName || 'Farmer'),
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

    // Generate AI response using Krishi Sakhi AI
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: krishiSakhiAI.generateResponse(
          currentUserMessage, 
          currentCrops || [], 
          language, 
          farmerName || 'Farmer'
        ),
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
                <h3 className="font-semibold text-gray-900">Krishi Sakhi AI</h3>
                <Sparkles className="h-3 w-3 text-yellow-500" />
              </div>
              <p className="text-xs text-green-600">Expert Farming Assistant</p>
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
                className={`max-w-[85%] rounded-lg px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-sm'
                    : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 border border-gray-200'
                }`}
              >
                <div className="text-sm whitespace-pre-line">{message.message}</div>
                <p className="text-xs opacity-70 mt-2">
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
                placeholder={language === 'malayalam' ? 'വിള-നിർദ്ദിഷ്ട ചോദ്യം ചോദിക്കുക...' : 'Ask crop-specific questions...'}
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
            Language: {language === 'malayalam' ? '🇮🇳 മലയാളം' : '🇬🇧 English'} • Crop-specific AI guidance
          </div>
        </div>
      </div>
    </div>
  );
}