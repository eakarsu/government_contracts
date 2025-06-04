const Contract = require('../models/Contract');
const Search = require('../models/Search');
const Application = require('../models/Application');
const samGovService = require('../services/samGovService');
const vectorDbService = require('../services/vectorDbService');
const aiService = require('../services/aiService');

exports.searchContracts = async (req, res) => {
  try {
    const { 
      query, 
      dateFrom, 
      dateTo, 
      naicsCode, 
      setAside, 
      placeOfPerformance,
      agency,
      minValue,
      maxValue 
    } = req.body;

    // Perform vector search if query provided
    let vectorResults = [];
    if (query) {
      vectorResults = await vectorDbService.searchContracts(query);
    }

    // Build MongoDB query
    const dbQuery = {};
    if (dateFrom || dateTo) {
      dbQuery.postedDate = {};
      if (dateFrom) dbQuery.postedDate.$gte = new Date(dateFrom);
      if (dateTo) dbQuery.postedDate.$lte = new Date(dateTo);
    }
    if (naicsCode) dbQuery.naicsCode = naicsCode;
    if (setAside) dbQuery.setAside = setAside;
    if (agency) dbQuery.department = new RegExp(agency, 'i');
    if (placeOfPerformance) {
      dbQuery['placeOfPerformance.state'] = placeOfPerformance;
    }

    // Get contracts from database
    const contracts = await Contract.find(dbQuery)
      .sort({ postedDate: -1 })
      .limit(100);

    // Combine results and calculate relevance scores
    const combinedResults = await combineAndScoreResults(
      contracts, 
      vectorResults,
      req.body
    );

    res.json({
      success: true,
      totalCount: combinedResults.length,
      contracts: combinedResults.slice(0, 50), // Limit to 50 results
      averageRelevance: calculateAverageRelevance(combinedResults),
      searchCriteria: req.body
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching contracts' 
    });
  }
};

exports.listContracts = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'postedDate' } = req.query;
    
    const contracts = await Contract.find()
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Contract.countDocuments();

    res.json({
      success: true,
      contracts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });
  } catch (error) {
    console.error('List contracts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching contracts' 
    });
  }
};

exports.getContractDetails = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contract not found' 
      });
    }

    res.json(contract);
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching contract details' 
    });
  }
};

exports.getContractAnalysis = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contract not found' 
      });
    }

    // Check if analysis already exists
    if (contract.aiAnalysis?.analyzed) {
      return res.json(contract.aiAnalysis);
    }

    // Perform AI analysis
    const analysis = await aiService.analyzeContract(contract);
    
    // Save analysis
    contract.aiAnalysis = {
      ...analysis,
      analyzed: true,
      analyzedAt: new Date()
    };
    await contract.save();

    res.json(analysis);
  } catch (error) {
    console.error('Contract analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error analyzing contract' 
    });
  }
};

exports.processDocuments = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contract not found' 
      });
    }

    // Process each attachment
    const processedDocs = [];
    for (const attachment of contract.attachments) {
      if (!attachment.processed) {
        const extracted = await aiService.extractTextFromDocument(attachment.url);
        attachment.extractedText = extracted.text;
        attachment.processed = true;
        
        // Store in vector DB
        const vectorId = await vectorDbService.storeDocument({
          contractId: contract._id,
          documentName: attachment.name,
          text: extracted.text
        });
        attachment.vectorId = vectorId;
        
        processedDocs.push(attachment.name);
      }
    }

    await contract.save();

    res.json({
      success: true,
      processedCount: processedDocs.length,
      processedDocuments: processedDocs
    });
  } catch (error) {
    console.error('Process documents error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing documents' 
    });
  }
};

exports.indexContracts = async (req, res) => {
  try {
    const { from, to } = req.body;
    
    // Fetch contracts from SAM.gov
    const samContracts = await samGovService.fetchContracts({
      postedFrom: from,
      postedTo: to
    });

    // Process and save each contract
    let indexed = 0;
    for (const samContract of samContracts) {
      try {
        // Check if contract already exists
        const existing = await Contract.findOne({ noticeId: samContract.noticeId });
        if (!existing) {
          const contract = new Contract({
            ...transformSamContract(samContract),
            lastChecked: new Date()
          });
          await contract.save();
          
          // Index in vector DB
          await vectorDbService.indexContract(contract);
          indexed++;
        }
      } catch (err) {
        console.error(`Error indexing contract ${samContract.noticeId}:`, err);
      }
    }

    res.json({
      success: true,
      totalFetched: samContracts.length,
      newlyIndexed: indexed,
      message: `Successfully indexed ${indexed} new contracts`
    });
  } catch (error) {
    console.error('Index contracts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error indexing contracts' 
    });
  }
};

exports.saveSearch = async (req, res) => {
  try {
    const search = new Search({
      userId: req.userId,
      ...req.body
    });
    
    await search.save();
    res.json(search);
  } catch (error) {
    console.error('Save search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving search' 
    });
  }
};

exports.getSavedSearches = async (req, res) => {
  try {
    const searches = await Search.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    
    res.json(searches);
  } catch (error) {
    console.error('Get searches error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching saved searches' 
    });
  }
};

exports.deleteSearch = async (req, res) => {
  try {
    await Search.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting search' 
    });
  }
};

exports.toggleSearchAlert = async (req, res) => {
  try {
    const { enabled } = req.body;
    
    const search = await Search.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      { alertEnabled: enabled },
      { new: true }
    );
    
    res.json(search);
  } catch (error) {
    console.error('Toggle alert error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating search alert' 
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get various stats
    const [
      activeContracts,
      savedSearches,
      applications,
      recentActivity
    ] = await Promise.all([
      Contract.countDocuments({ responseDeadline: { $gte: new Date() } }),
      Search.countDocuments({ userId }),
      Application.countDocuments({ userId }),
      getRecentActivity(userId)
    ]);

    // Calculate trends (mock data for now)
    const stats = {
      activeContracts,
      savedSearches,
      applications,
      successRate: 75, // This would be calculated from actual data
      contractsTrend: 12,
      applicationsTrend: 8,
      recentActivity,
      chartData: await getChartData()
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard stats' 
    });
  }
};

// Helper functions
function transformSamContract(samContract) {
  return {
    noticeId: samContract.noticeId,
    title: samContract.title,
    solicitationNumber: samContract.solicitationNumber,
    department: samContract.department,
    subTier: samContract.subtierAgency,
    office: samContract.office,
    postedDate: new Date(samContract.postedDate),
    responseDeadline: new Date(samContract.responseDeadLine),
    archiveDate: samContract.archiveDate ? new Date(samContract.archiveDate) : null,
    type: samContract.type,
    baseType: samContract.baseType,
    setAside: samContract.typeOfSetAside,
    description: samContract.description,
    naicsCode: samContract.naicsCode,
    classificationCode: samContract.classificationCode,
    placeOfPerformance: {
      city: samContract.placeOfPerformance?.city?.name,
      state: samContract.placeOfPerformance?.state?.name,
      country: samContract.placeOfPerformance?.country?.name
    },
    attachments: samContract.resourceLinks?.map(link => ({
      name: link.name || 'Document',
      url: link.url,
      postedDate: new Date()
    })) || []
  };
}

async function combineAndScoreResults(dbResults, vectorResults, criteria) {
  // Combine and score results based on multiple factors
  const combined = [...dbResults];
  
  // Add relevance scores
  combined.forEach(contract => {
    let score = 50; // Base score
    
    // Vector similarity score
    const vectorMatch = vectorResults.find(v => v.id === contract._id.toString());
    if (vectorMatch) {
      score += vectorMatch.score * 30;
    }
    
    // Criteria matching
    if (criteria.naicsCode && contract.naicsCode === criteria.naicsCode) {
      score += 10;
    }
    if (criteria.setAside && contract.setAside === criteria.setAside) {
      score += 10;
    }
    
    contract.relevanceScore = Math.min(100, Math.round(score));
  });
  
  // Sort by relevance score
  return combined.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function calculateAverageRelevance(contracts) {
  if (contracts.length === 0) return 0;
  const total = contracts.reduce((sum, c) => sum + (c.relevanceScore || 0), 0);
  return Math.round(total / contracts.length);
}

async function getRecentActivity(userId) {
  // Get recent activities (simplified version)
  const activities = [];
  
  // Recent searches
  const recentSearches = await Search.find({ userId })
    .sort({ lastRun: -1 })
    .limit(3);
  
  recentSearches.forEach(search => {
    activities.push({
      type: 'search',
      title: `Ran search: ${search.name}`,
      timestamp: search.lastRun || search.createdAt
    });
  });
  
  // Recent applications
  const recentApps = await Application.find({ userId })
    .sort({ lastModified: -1 })
    .limit(3);
  
  recentApps.forEach(app => {
    activities.push({
      type: 'application',
      title: `Updated application: ${app.contractTitle}`,
      timestamp: app.lastModified
    });
  });
  
  // Sort by timestamp
  return activities.sort((a, b) => b.timestamp - a.timestamp);
}

async function getChartData() {
  // Generate chart data for the last 6 months
  const charts = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const count = await Contract.countDocuments({
      postedDate: {
        $gte: date,
        $lt: nextMonth
      }
    });
    
    charts.push({
      month: date.toLocaleString('default', { month: 'short' }),
      contracts: count,
      value: count * 325000 // Mock average value
    });
  }
  
  return charts;
}