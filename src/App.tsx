import React, { useState } from 'react';
import { MessageSquare, Calendar, Clock } from 'lucide-react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import ActivityLogger from './components/ActivityLogger';
import MarketPrices from './components/MarketPrices';
import KnowledgeBase from './components/KnowledgeBase';
import FarmerProfile from './components/FarmerProfile';
import CropCalendar from './components/CropCalendar';
import ProgressTracker from './components/ProgressTracker';
import SchemeAlerts from './components/SchemeAlerts';
import NotificationCenter from './components/NotificationCenter';
import CropDiagnosis from './components/CropDiagnosis';
import CommunityForum from './components/CommunityForum';
import AuthPage from './components/AuthPage';
import EmptyState from './components/EmptyState';
import { sampleFarmers, getFarmerData, setCurrentFarmer } from './data/mockData';
import { Activity, Advisory, Farmer } from './types/farmer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isActivityLoggerOpen, setIsActivityLoggerOpen] = useState(false);
  const [isCropDiagnosisOpen, setIsCropDiagnosisOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [farmer, setFarmer] = useState<Farmer>(sampleFarmers[0]);
  const [currentFarmerData, setCurrentFarmerData] = useState(getFarmerData('1'));
  const [activities, setActivities] = useState<Activity[]>(currentFarmerData.activities);

  const handleLogin = (loggedInFarmer: Farmer) => {
    setCurrentFarmer(loggedInFarmer.id);
    const farmerData = getFarmerData(loggedInFarmer.id);
    setCurrentFarmerData(farmerData);
    setActivities(farmerData.activities);
    setFarmer(loggedInFarmer);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setFarmer(sampleFarmers[0]);
    setCurrentFarmerData(getFarmerData('1'));
    setActivities(getFarmerData('1').activities);
    setActiveTab('dashboard');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'log-activity':
        setIsActivityLoggerOpen(true);
        break;
      case 'view-calendar':
        setActiveTab('knowledge');
        break;
      case 'market-prices':
        setActiveTab('market');
        break;
      case 'weather-alerts':
        setIsNotificationOpen(true);
        break;
      case 'offline-mode':
        alert('Offline mode feature would be implemented here for areas with poor connectivity');
        break;
      case 'take-photo':
        // In a real app, this would open camera
        alert('Camera feature would be implemented here');
        break;
      case 'view-reports':
        alert('Reports feature would be implemented here');
        break;
      case 'settings':
        alert('Settings feature would be implemented here');
        break;
      case 'crop-doctor':
        setIsCropDiagnosisOpen(true);
        break;
      case 'community':
        setIsCommunityOpen(true);
        break;
      default:
        break;
    }
  };

  const handleSaveActivity = (newActivity: Omit<Activity, 'id' | 'farmerId'>) => {
    const activity: Activity = {
      ...newActivity,
      id: Date.now().toString(),
      farmerId: farmer.id
    };
    setActivities(prev => [activity, ...prev]);
  };

  const handleAdvisoryAction = (advisory: Advisory) => {
    // In a real app, this would handle specific actions for each advisory
    alert(`Taking action for: ${advisory.title}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            farm={currentFarmerData.farm}
            activities={activities}
            advisories={currentFarmerData.advisories}
            onQuickAction={handleQuickAction}
            onAdvisoryAction={handleAdvisoryAction}
            onEditFarm={() => alert('Farm edit feature would be implemented here')}
          />
        );
      case 'market':
        return <MarketPrices />;
      case 'profile':
        return <FarmerProfile farmer={farmer} onUpdate={setFarmer} />;
      case 'farm':
        return <CropCalendar />;
      case 'progress':
        return <ProgressTracker activities={activities} crops={currentFarmerData.farm.crops} />;
      case 'schemes':
        return <SchemeAlerts />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'activities':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Farm Activities</h2>
                <p className="text-gray-600">Track all your farming activities</p>
              </div>
              <button
                onClick={() => setIsActivityLoggerOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Log New Activity
              </button>
            </div>
            
            <div className="space-y-4">
              {activities.length > 0 ? activities.map((activity) => (
                <div key={activity.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 capitalize">{activity.type}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{activity.description}</p>
                      {activity.notes && (
                        <p className="text-sm text-gray-600 italic mb-2">{activity.notes}</p>
                      )}
                      {activity.cost && (
                        <div className="text-sm text-green-700 font-medium">
                          Cost: ₹{activity.cost.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <EmptyState
                  icon={Clock}
                  title="No Activities Yet"
                  description="Start logging your farming activities to track progress"
                  actionLabel="Log First Activity"
                  onAction={() => setIsActivityLoggerOpen(true)}
                />
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Feature
            </h3>
            <p className="text-gray-600">
              This feature would be implemented with full functionality in the production version.
            </p>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} sampleFarmers={sampleFarmers} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        farmerName={farmer.name}
        onLogout={handleLogout}
        onMenuClick={() => setIsMenuOpen(true)}
        onChatClick={() => setIsChatOpen(true)}
        onNotificationClick={() => setIsNotificationOpen(true)}
        unreadNotifications={currentFarmerData.advisories.filter(a => a.actionRequired).length}
      />
      
      <Navigation
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        farmerName={farmer.name}
        currentCrops={currentFarmerData.farm.crops}
        recentActivities={activities.slice(0, 3)}
      />

      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
      
      <CropDiagnosis
        isOpen={isCropDiagnosisOpen}
        onClose={() => setIsCropDiagnosisOpen(false)}
      />
      
      <CommunityForum
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
      />
      
      <ActivityLogger
        isOpen={isActivityLoggerOpen}
        onClose={() => setIsActivityLoggerOpen(false)}
        onSave={handleSaveActivity}
        crops={currentFarmerData.farm.crops}
      />

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-30 animate-pulse"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Floating Activity Logger Button */}
      <button
        onClick={() => setIsActivityLoggerOpen(true)}
        className="fixed bottom-6 right-20 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-30"
      >
        <Calendar className="h-5 w-5" />
      </button>
    </div>
  );
}

export default App;