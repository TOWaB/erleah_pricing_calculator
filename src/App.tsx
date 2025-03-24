import React, { useState, useEffect } from 'react';

const ErleahPricingCalculator = () => {
  // Default parameters
  const [params, setParams] = useState({
    // Basic parameters
    adoptionRate: 0.7,
    messagesPerDay: 10,
    eventDays: 2,
    tokensPerInteraction: 7500,
    
    // LLM costs
    azureLLMCost: 10,
    groqLLMCost: 0.8,
    
    // Infrastructure
    instanceCost: 0.133,
    avgUtilization: 0.4,
    activeHours: 8,
    setupDays: 1,
    teardownDays: 0.5,
    peakFactor: 0.2,
    efficiencyFactor: 0.6,
    
    // Human resources rates
    csmRate: 150,
    dataAnalystRate: 100,
    techLeadRate: 125,
    juniorSupportRate: 80,
    onsiteRate: 80,
    onlineRate: 70,
    
    // Client workshop hours
    workshopCsmHours: 3,
    workshopDataAnalystHours: 5,
    
    // Data & AI Blueprint hours
    blueprintCsmHours: 5,
    blueprintDataAnalystHours: 3,
    blueprintTechLeadHours: 1,
    
    // Deployment & Delivery hours
    deploymentTechLeadHours: 8,
    deploymentCsmHours: 3,
    deploymentDataAnalystHours: 5,
    
    // Event support
    juniorSupportCount: 2,
    techLeadSupportHoursPerDay: 2,
    
    // Pricing components
    initialWorkshopFee: 5000,
    setupFeeSmall: 7500,
    setupFeeMedium: 15000,
    setupFeeLarge: 25000,
    onsiteSupportFee: 1500,
    onlineSupportFee: 1200,
    perAttendeeAzure: 1.5,
    perAttendeeGroq: 0.5,
    annualBaseFeeSmall: 10000,
    annualBaseFeeMedium: 20000,
    annualBaseFeeLarge: 35000,
    targetMargin: 0.25
  });
  
  // Input fields state
  const [eventSize, setEventSize] = useState("medium");
  const [attendees, setAttendees] = useState(5000);
  const [usageIntensity, setUsageIntensity] = useState(0.5);
  const [llmProvider, setLLMProvider] = useState("groq");
  const [onsiteStaff, setOnsiteStaff] = useState(1);
  const [onlineStaff, setOnlineStaff] = useState(2);
  const [pricingModel, setPricingModel] = useState("component");
  const [workshopIncluded, setWorkshopIncluded] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState("calculator");
  const [paramSection, setParamSection] = useState("usage");
  
  // Calculations result state
  const [calculations, setCalculations] = useState({});
  
  // Preset event sizes
  const eventSizes = {
    small: 2000,
    medium: 5000,
    large: 15000,
    veryLarge: 35000
  };
  
  // Preset usage intensities
  const usageIntensities = {
    low: 0.3,
    medium: 0.5,
    high: 0.7
  };
  
  // Helper function to update specific parameter
  const updateParam = (key, value) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Effect to update attendees when event size changes
  useEffect(() => {
    setAttendees(eventSizes[eventSize]);
  }, [eventSize]);
  
  // Effect to recalculate when any input changes
  useEffect(() => {
    calculateCosts();
  }, [
    attendees, 
    usageIntensity, 
    llmProvider, 
    onsiteStaff, 
    onlineStaff, 
    params, 
    pricingModel,
    workshopIncluded
  ]);
  
  // Calculate all costs and pricing
  const calculateCosts = () => {
    // User metrics
    const potentialUsers = Math.round(attendees * params.adoptionRate);
    const activeUsers = Math.round(potentialUsers * usageIntensity);
    
    // Message metrics
    const totalMessages = activeUsers * params.messagesPerDay * params.eventDays;
    const totalTokens = totalMessages * params.tokensPerInteraction;
    
    // LLM costs
    const llmCostPerMillion = llmProvider === "azure" ? params.azureLLMCost : params.groqLLMCost;
    const llmCost = (totalTokens / 1000000) * llmCostPerMillion;
    
    // Infrastructure
    const maxInstances = Math.ceil((attendees * params.adoptionRate * usageIntensity * params.peakFactor) / 60 * params.efficiencyFactor);
    
    const eventDayCost = maxInstances * params.activeHours * params.avgUtilization * params.instanceCost * params.eventDays;
    const setupTeardownCost = maxInstances * params.activeHours * 0.15 * params.instanceCost * (params.setupDays + params.teardownDays);
    const infrastructureCost = eventDayCost + setupTeardownCost;
    
    // Human costs - Calculate each phase
    // Client Workshop
    const workshopCost = (params.workshopCsmHours * params.csmRate) + 
                         (params.workshopDataAnalystHours * params.dataAnalystRate);
    
    // Data & AI Blueprint
    const blueprintCost = (params.blueprintCsmHours * params.csmRate) + 
                          (params.blueprintDataAnalystHours * params.dataAnalystRate) +
                          (params.blueprintTechLeadHours * params.techLeadRate);
    
    // Deployment & Delivery
    const deploymentCost = (params.deploymentTechLeadHours * params.techLeadRate) + 
                           (params.deploymentCsmHours * params.csmRate) +
                           (params.deploymentDataAnalystHours * params.dataAnalystRate);
    
    // Pre-event total cost
    const preEventCost = workshopCost + blueprintCost + deploymentCost;
    
    // Event Support
    const juniorSupportCost = params.juniorSupportCount * 8 * params.eventDays * params.juniorSupportRate;
    const techLeadEventSupportCost = params.techLeadSupportHoursPerDay * params.eventDays * params.techLeadRate;
    
    // Support staff on site and online during event
    const eventSupportStaffCost = (onsiteStaff * 8 * params.eventDays * params.onsiteRate) + 
                                 (onlineStaff * 8 * params.eventDays * params.onlineRate);
    
    const eventSupportCost = juniorSupportCost + techLeadEventSupportCost + eventSupportStaffCost;
    
    // Total human cost
    const totalHumanCost = preEventCost + eventSupportCost;
    
    // Total costs
    const technologyCost = llmCost + infrastructureCost;
    const totalCost = technologyCost + totalHumanCost;
    const costPerAttendee = totalCost / attendees;
    
    // Determine setup fee based on event size
    let setupFee;
    if (attendees <= 2000) {
      setupFee = params.setupFeeSmall;
    } else if (attendees <= 10000) {
      setupFee = params.setupFeeMedium;
    } else {
      setupFee = params.setupFeeLarge;
    }
    
    // Component-based pricing calculation
    const initialWorkshopFee = workshopIncluded ? params.initialWorkshopFee : 0;
    const supportFee = (onsiteStaff * params.onsiteSupportFee) + (onlineStaff * params.onlineSupportFee);
    const perAttendeeFee = llmProvider === "azure" ? params.perAttendeeAzure : params.perAttendeeGroq;
    const attendeeFee = attendees * perAttendeeFee;
    
    // Annual pricing calculation
    let annualBaseFee;
    if (attendees <= 2000) {
      annualBaseFee = params.annualBaseFeeSmall;
    } else if (attendees <= 10000) {
      annualBaseFee = params.annualBaseFeeMedium;
    } else {
      annualBaseFee = params.annualBaseFeeLarge;
    }
    
    // Final pricing based on selected model
    let totalPrice;
    if (pricingModel === "component") {
      // If workshop is credited towards setup when signing
      const adjustedSetupFee = workshopIncluded ? 
        Math.max(0, setupFee - params.initialWorkshopFee) : setupFee;
      
      totalPrice = initialWorkshopFee + adjustedSetupFee + supportFee + attendeeFee;
    } else { // annual model
      totalPrice = annualBaseFee + supportFee;
    }
    
    const profit = totalPrice - totalCost;
    const profitMargin = profit / totalPrice;
    const pricePerAttendee = totalPrice / attendees;
    
    setCalculations({
      potentialUsers,
      activeUsers,
      totalMessages,
      totalTokens,
      llmCost,
      infrastructureCost,
      maxInstances,
      workshopCost,
      blueprintCost,
      deploymentCost,
      preEventCost,
      juniorSupportCost,
      techLeadEventSupportCost,
      eventSupportStaffCost,
      eventSupportCost,
      totalHumanCost,
      technologyCost,
      totalCost,
      costPerAttendee,
      setupFee,
      supportFee,
      attendeeFee,
      annualBaseFee,
      totalPrice,
      profit,
      profitMargin,
      pricePerAttendee,
      initialWorkshopFee
    });
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format percentage
  const formatPercent = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  };
  
  // Format number with commas
  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Erleah Pricing Calculator</h1>
      
      {/* Tab navigation */}
      <div className="flex mb-6 border-b">
        <button 
          className={`py-2 px-4 ${activeTab === 'calculator' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('calculator')}
        >
          Calculator
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'parameters' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('parameters')}
        >
          Parameters
        </button>
      </div>
      
      {activeTab === 'parameters' && (
        <div className="mb-8">
          <div className="flex mb-4 overflow-x-auto">
            <button 
              className={`py-1 px-3 mr-2 text-sm rounded ${paramSection === 'usage' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              onClick={() => setParamSection('usage')}
            >
              Usage
            </button>
            <button 
              className={`py-1 px-3 mr-2 text-sm rounded ${paramSection === 'llm' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              onClick={() => setParamSection('llm')}
            >
              LLM Costs
            </button>
            <button 
              className={`py-1 px-3 mr-2 text-sm rounded ${paramSection === 'team' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              onClick={() => setParamSection('team')}
            >
              Team
            </button>
            <button 
              className={`py-1 px-3 mr-2 text-sm rounded ${paramSection === 'hours' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              onClick={() => setParamSection('hours')}
            >
              Work Hours
            </button>
            <button 
              className={`py-1 px-3 mr-2 text-sm rounded ${paramSection === 'infrastructure' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              onClick={() => setParamSection('infrastructure')}
            >
              Infrastructure
            </button>
            <button 
              className={`py-1 px-3 mr-2 text-sm rounded ${paramSection === 'pricing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              onClick={() => setParamSection('pricing')}
            >
              Pricing
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            {paramSection === 'usage' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adoption Rate </label>
                  <input
                    type="number"
                    min="0.01"
                    max="1"
                    step="0.05"
                    value={params.adoptionRate}
                    onChange={(e) => updateParam('adoptionRate', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                   />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Messages Per User Per Day</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={params.messagesPerDay}
                    onChange={(e) => updateParam('messagesPerDay', parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Days</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={params.eventDays}
                    onChange={(e) => updateParam('eventDays', parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tokens Per Message</label>
                  <input 
                    type="number" 
                    min="100" 
                    step="100" 
                    value={params.tokensPerInteraction}
                    onChange={(e) => updateParam('tokensPerInteraction', parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
            
            {paramSection === 'llm' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Azure LLM Cost (per million tokens)</label>
                  <input 
                    type="number" 
                    min="0.1" 
                    step="0.1" 
                    value={params.azureLLMCost}
                    onChange={(e) => updateParam('azureLLMCost', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Groq LLM Cost (per million tokens)</label>
                  <input 
                    type="number" 
                    min="0.1" 
                    step="0.1" 
                    value={params.groqLLMCost}
                    onChange={(e) => updateParam('groqLLMCost', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
            
            {paramSection === 'team' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CSM Rate (per hour)</label>
                  <input 
                    type="number" 
                    min="50" 
                    step="5" 
                    value={params.csmRate}
                    onChange={(e) => updateParam('csmRate', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Analyst Rate (per hour)</label>
                  <input 
                    type="number" 
                    min="50" 
                    step="5" 
                    value={params.dataAnalystRate}
                    onChange={(e) => updateParam('dataAnalystRate', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tech Lead Rate (per hour)</label>
                  <input 
                    type="number" 
                    min="50" 
                    step="5" 
                    value={params.techLeadRate}
                    onChange={(e) => updateParam('techLeadRate', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Junior Support Rate (per hour)</label>
                  <input 
                    type="number" 
                    min="50" 
                    step="5" 
                    value={params.juniorSupportRate}
                    onChange={(e) => updateParam('juniorSupportRate', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Onsite Staff Rate (per hour)</label>
                  <input 
                    type="number" 
                    min="50" 
                    step="5" 
                    value={params.onsiteRate}
                    onChange={(e) => updateParam('onsiteRate', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Online Staff Rate (per hour)</label>
                  <input 
                    type="number" 
                    min="50" 
                    step="5" 
                    value={params.onlineRate}
                    onChange={(e) => updateParam('onlineRate', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Junior Support Staff</label>
                  <input 
                    type="number" 
                    min="1" 
                    step="1" 
                    value={params.juniorSupportCount}
                    onChange={(e) => updateParam('juniorSupportCount', parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tech Lead Support Hours Per Day</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.5" 
                    value={params.techLeadSupportHoursPerDay}
                    onChange={(e) => updateParam('techLeadSupportHoursPerDay', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
            
            {paramSection === 'hours' && (
              <div>
                <h3 className="font-medium mb-3">Client Workshop Hours</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CSM Hours</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.5" 
                      value={params.workshopCsmHours}
                      onChange={(e) => updateParam('workshopCsmHours', parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Analyst Hours</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.5" 
                      value={params.workshopDataAnalystHours}
                      onChange={(e) => updateParam('workshopDataAnalystHours', parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                <h3 className="font-medium mb-3">Data & AI Blueprint Hours</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CSM Hours</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.5" 
                      value={params.blueprintCsmHours}
                      onChange={(e) => updateParam('blueprintCsmHours', parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Analyst Hours</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.5" 
                      value={params.blueprintDataAnalystHours}
                      onChange={(e) => updateParam('blueprintDataAnalystHours', parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tech Lead Hours</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.5" 
                      value={params.blueprintTechLeadHours}
                      onChange={(e) => updateParam('blueprintTechLeadHours', parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                <h3 className="font-medium mb-3">Deployment & Delivery Hours</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tech Lead Hours</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.5" 
                      value={params.deploymentTechLeadHours}
                      onChange={(e) => updateParam('deploymentTechLeadHours', parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CSM Hours</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.5" 
                      value={params.deploymentCsmHours}
                      onChange={(e) => updateParam('deploymentCsmHours', parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Analyst Hours</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.5" 
                      value={params.deploymentDataAnalystHours}
                      onChange={(e) => updateParam('deploymentDataAnalystHours', parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {paramSection === 'infrastructure' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instance Cost (per hour)</label>
                  <input 
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    value={params.instanceCost}
                    onChange={(e) => updateParam('instanceCost', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Average Utilization</label>
                  <input 
                    type="number" 
                    min="0.1" 
                    max="1" 
                    step="0.05" 
                    value={params.avgUtilization}
                    onChange={(e) => updateParam('avgUtilization', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Active Hours Per Day</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="24" 
                    value={params.activeHours}
                    onChange={(e) => updateParam('activeHours', parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Setup Days</label>
                  <input 
                    type="number" 
                    min="0.5" 
                    step="0.5" 
                    value={params.setupDays}
                    onChange={(e) => updateParam('setupDays', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teardown Days</label>
                  <input 
                    type="number" 
                    min="0.5" 
                    step="0.5" 
                    value={params.teardownDays}
                    onChange={(e) => updateParam('teardownDays', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peak Factor</label>
                  <input 
                    type="number" 
                    min="0.1" 
                    max="1" 
                    step="0.05" 
                    value={params.peakFactor}
                    onChange={(e) => updateParam('peakFactor', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">Percentage of users active at peak times</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Efficiency Factor</label>
                  <input 
                    type="number" 
                    min="0.1" 
                    max="1" 
                    step="0.05" 
                    value={params.efficiencyFactor}
                    onChange={(e) => updateParam('efficiencyFactor', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ratio of required servers to theoretical maximum</p>
                </div>
              </div>
            )}
            
            {paramSection === 'pricing' && (
              <div>
                <h3 className="font-medium mb-3">Setup Fees</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Workshop Fee</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="100" 
                      value={params.initialWorkshopFee}
                      onChange={(e) => updateParam('initialWorkshopFee', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Setup Fee (Small Events)</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="100" 
                      value={params.setupFeeSmall}
                      onChange={(e) => updateParam('setupFeeSmall', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Setup Fee (Medium Events)</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="100" 
                      value={params.setupFeeMedium}
                      onChange={(e) => updateParam('setupFeeMedium', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Setup Fee (Large Events)</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="100" 
                      value={params.setupFeeLarge}
                      onChange={(e) => updateParam('setupFeeLarge', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                <h3 className="font-medium mb-3">Support Fees</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Onsite Support Fee (per staff)</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="100" 
                      value={params.onsiteSupportFee}
                      onChange={(e) => updateParam('onsiteSupportFee', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Online Support Fee (per staff)</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="100" 
                      value={params.onlineSupportFee}
                      onChange={(e) => updateParam('onlineSupportFee', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                <h3 className="font-medium mb-3">Per-Attendee Pricing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Per Attendee Fee (Azure)</label>
                    <input 
                      type="number" 
                      min="0.1" 
                      step="0.1" 
                      value={params.perAttendeeAzure}
                      onChange={(e) => updateParam('perAttendeeAzure', parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Per Attendee Fee (Groq)</label>
                    <input 
                      type="number" 
                      min="0.1" 
                      step="0.1" 
                      value={params.perAttendeeGroq}
                      onChange={(e) => updateParam('perAttendeeGroq', parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                <h3 className="font-medium mb-3">Annual Subscription</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual Base Fee (Small)</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="100" 
                      value={params.annualBaseFeeSmall}
                      onChange={(e) => updateParam('annualBaseFeeSmall', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual Base Fee (Medium)</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="100" 
                      value={params.annualBaseFeeMedium}
                      onChange={(e) => updateParam('annualBaseFeeMedium', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual Base Fee (Large)</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="100" 
                      value={params.annualBaseFeeLarge}
                      onChange={(e) => updateParam('annualBaseFeeLarge', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Profit Margin</label>
                    <input 
                      type="number" 
                      min="0.05" 
                      max="0.75" 
                      step="0.05" 
                      value={params.targetMargin}
                      onChange={(e) => updateParam('targetMargin', parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
            )}
