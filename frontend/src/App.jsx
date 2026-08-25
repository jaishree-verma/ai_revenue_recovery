import React, { useState, useEffect } from 'react';
import Header, { CUSTOMER_PERSONAS } from './components/Header';
import RevenueDashboard from './components/RevenueDashboard';
import ArchitectureExplainer from './components/ArchitectureExplainer';
import VoiceSimulator from './components/VoiceSimulator';
import ChatInterface from './components/ChatInterface';
import GovernanceDashboard from './components/GovernanceDashboard';
import EscalationPortal from './components/EscalationPortal';
import PolicyInspector from './components/PolicyInspector';
import CustomerContextCard from './components/CustomerContextCard';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeCustomer, setActiveCustomer] = useState(CUSTOMER_PERSONAS[0]);

  const [customerData, setCustomerData] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [cardsData, setCardsData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCustomerContext = async (custId) => {
    setLoading(true);
    try {
      const [cust, acc, cards, metricsData] = await Promise.all([
        api.getCustomer(custId),
        api.getAccount(custId).catch(() => null),
        api.getCards(custId).catch(() => []),
        api.getRecoveryMetrics().catch(() => null)
      ]);
      setCustomerData(cust);
      setAccountData(acc);
      setCardsData(cards);
      setMetrics(metricsData);
    } catch (err) {
      console.error('Error loading customer context:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerContext(activeCustomer.id);
  }, [activeCustomer.id]);

  const handleGovernanceEvent = () => {
    loadCustomerContext(activeCustomer.id);
  };

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col font-sans selection:bg-[#00c988] selection:text-black">
      
      {/* Top Navigation & Metric Ticker Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCustomer={activeCustomer}
        setActiveCustomer={setActiveCustomer}
        metrics={metrics}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Revenue Hub Dashboard (Default Primary Tab) */}
        {activeTab === 'dashboard' && (
          <RevenueDashboard 
            onSelectCase={(item) => {
              const persona = CUSTOMER_PERSONAS.find(p => p.id === item.customer_id) || CUSTOMER_PERSONAS[0];
              setActiveCustomer(persona);
            }}
            onNavigateToArchitecture={() => setActiveTab('architecture')}
          />
        )}

        {/* Architecture & Steps Deep-Dive Tab */}
        {activeTab === 'architecture' && (
          <ArchitectureExplainer />
        )}

        {/* Voice & WhatsApp Intervention Lab */}
        {activeTab === 'simulator' && (
          <VoiceSimulator />
        )}

        {/* AI Orchestrator Chat Interface */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <ChatInterface
                activeCustomer={activeCustomer}
                onGovernanceEvent={handleGovernanceEvent}
              />
            </div>
            <div className="lg:col-span-4">
              <CustomerContextCard
                customerData={customerData}
                accountData={accountData}
                cardsData={cardsData}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Audit Trail & Governance Logs */}
        {activeTab === 'governance' && <GovernanceDashboard />}

        {/* Human Specialist Escalations Portal */}
        {activeTab === 'escalations' && <EscalationPortal />}

        {/* Stopping Rules & Policies Inspector */}
        {activeTab === 'policies' && <PolicyInspector />}

      </main>

      {/* Footer */}
      <footer className="bg-[#080d19] border-t border-[#1b2a42] py-4 text-center text-xs text-slate-400 font-mono flex flex-wrap items-center justify-center gap-3">
        <span className="w-2 h-2 rounded-full bg-[#00c988] inline-block animate-pulse"></span>
        <span className="text-white font-bold">Razorpay Buildathon • Track 03 AI Revenue Recovery</span>
        <span>•</span>
        <span>Bounded Autonomy • Stopping Rules • Measured ROI</span>
        <span>•</span>
        <span className="text-slate-500">FastAPI &amp; React</span>
      </footer>

    </div>
  );
}
