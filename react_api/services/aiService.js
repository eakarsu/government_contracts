const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.apiUrl = process.env.OPENROUTER_API_URL;
    this.model = process.env.AI_MODEL || 'anthropic/claude-3-opus';
  }

  async analyzeContract(contract) {
    try {
      const prompt = this.buildContractAnalysisPrompt(contract);
      
      const response = await this.callAI(prompt);
      
      return this.parseContractAnalysis(response);
    } catch (error) {
      console.error('AI analysis error:', error);
      throw new Error('Failed to analyze contract');
    }
  }

  async generateFormStructure(contract, company) {
    try {
      const prompt = this.buildFormGenerationPrompt(contract, company);
      
      const response = await this.callAI(prompt);
      
      return this.parseFormStructure(response);
    } catch (error) {
      console.error('Form generation error:', error);
      throw new Error('Failed to generate form structure');
    }
  }

  async extractTextFromDocument(documentUrl) {
    try {
      // In production, this would:
      // 1. Download the document
      // 2. Extract text using OCR or PDF parsing
      // 3. Return the extracted text
      
      // For now, return mock data
      return {
        text: 'Extracted document text would go here',
        pages: 1
      };
    } catch (error) {
      console.error('Document extraction error:', error);
      throw new Error('Failed to extract text from document');
    }
  }

  async callAI(prompt) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API error:', error.response?.data || error.message);
      throw new Error('Failed to call AI service');
    }
  }

  buildContractAnalysisPrompt(contract) {
    return `Analyze this government contract opportunity and provide insights:

Title: ${contract.title}
Agency: ${contract.department}
Description: ${contract.description}
NAICS Code: ${contract.naicsCode}
Set-Aside: ${contract.setAside || 'None'}
Response Deadline: ${contract.responseDeadline}

Please provide:
1. Key requirements (list 5-10 main requirements)
2. Required certifications or qualifications
3. Estimated effort and team size
4. Match score (0-100) based on typical small business capabilities
5. Main challenges for implementation
6. Opportunities or advantages
7. Recommendation (pursue/maybe/pass) with reasoning

Format the response as a structured JSON object.`;
  }

  buildFormGenerationPrompt(contract, company) {
    return `Generate a form structure for applying to this government contract:

Contract Title: ${contract.title}
Agency: ${contract.department}
Type: ${contract.type}
Set-Aside: ${contract.setAside || 'None'}

Company Info:
${JSON.stringify(company?.basicInfo || {}, null, 2)}

Create a comprehensive form structure with sections for:
1. Company Information (pre-fill where possible)
2. Technical Approach
3. Past Performance
4. Key Personnel
5. Pricing (if applicable)
6. Certifications and Compliance

Return as a JSON structure with sections and fields.
Each field should have: name, label, type, required, placeholder, helpText`;
  }

  parseContractAnalysis(aiResponse) {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(aiResponse);
      return {
        keyRequirements: parsed.keyRequirements || [],
        requiredCertifications: parsed.requiredCertifications || [],
        estimatedEffort: parsed.estimatedEffort || 'Unknown',
        suggestedTeamSize: parsed.suggestedTeamSize || 0,
        matchScore: parsed.matchScore || 50,
        matchReason: parsed.matchReason || '',
        challenges: parsed.challenges || [],
        opportunities: parsed.opportunities || [],
        recommendation: parsed.recommendation || 'Review needed'
      };
    } catch (error) {
      // Fallback parsing if not valid JSON
      return {
        keyRequirements: ['Review contract documents for detailed requirements'],
        matchScore: 50,
        recommendation: 'Manual review required',
        rawAnalysis: aiResponse
      };
    }
  }

  parseFormStructure(aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse);
      
      // Ensure proper structure
      return {
        title: parsed.title || 'Contract Application Form',
        description: parsed.description || '',
        sections: parsed.sections || this.getDefaultFormSections()
      };
    } catch (error) {
      // Return default form structure if parsing fails
      return this.getDefaultFormStructure();
    }
  }

  getDefaultFormStructure() {
    return {
      title: 'Government Contract Application',
      description: 'Complete all required fields to submit your application',
      sections: [
        {
          title: 'Company Information',
          description: 'Basic information about your company',
          fields: [
            {
              name: 'companyName',
              label: 'Company Name',
              type: 'text',
              required: true,
              placeholder: 'Enter your company name'
            },
            {
              name: 'dunsNumber',
              label: 'DUNS Number',
              type: 'text',
              required: true,
              placeholder: '9-digit DUNS number'
            },
            {
              name: 'cageCode',
              label: 'CAGE Code',
              type: 'text',
              required: false,
              placeholder: '5-character CAGE code'
            }
          ]
        },
        {
          title: 'Technical Approach',
          description: 'Describe your technical approach to fulfilling this contract',
          fields: [
            {
              name: 'technicalApproach',
              label: 'Technical Approach',
              type: 'textarea',
              required: true,
              placeholder: 'Describe your approach...',
              rows: 8
            },
            {
              name: 'keyPersonnel',
              label: 'Key Personnel',
              type: 'textarea',
              required: true,
              placeholder: 'List key personnel and their qualifications...',
              rows: 6
            }
          ]
        },
        {
          title: 'Past Performance',
          description: 'Provide examples of similar work',
          fields: [
            {
              name: 'pastPerformance',
              label: 'Past Performance Examples',
              type: 'textarea',
              required: true,
              placeholder: 'Describe relevant past contracts...',
              rows: 8
            }
          ]
        }
      ]
    };
  }
}

module.exports = new AIService();